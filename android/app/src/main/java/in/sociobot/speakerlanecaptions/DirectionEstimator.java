package in.sociobot.speakerlanecaptions;

import android.content.Context;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;

/**
 * Samples a two-channel microphone only long enough to calculate a coarse
 * balance. Samples are discarded in the same read loop: no audio is written,
 * buffered between reads, or sent outside the device.
 */
final class DirectionEstimator {
    private static final int SAMPLE_RATE = 16_000;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_STEREO;
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    private static final double MIN_SIGNAL = 0.025d;
    private static final double DIRECTION_THRESHOLD = 0.14d;

    interface Listener {
        void onDirection(DirectionEstimate estimate);
    }

    static final class DirectionEstimate {
        final String lane;
        final float confidence;
        final boolean automatic;
        final String message;

        DirectionEstimate(String lane, float confidence, boolean automatic, String message) {
            this.lane = lane;
            this.confidence = confidence;
            this.automatic = automatic;
            this.message = message;
        }
    }

    private final Context context;
    private final Listener listener;
    private volatile boolean running;
    private volatile AudioRecord recorder;
    private volatile DirectionEstimate latest = manualEstimate();
    private Thread worker;

    DirectionEstimator(Context context, Listener listener) {
        this.context = context.getApplicationContext();
        this.listener = listener;
    }

    DirectionEstimate latest() {
        return latest;
    }

    void start() {
        stop();
        final int minimum = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT);
        if (minimum <= 0) {
            publish(manualEstimate());
            return;
        }
        try {
            recorder = new AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                Math.max(minimum, SAMPLE_RATE / 2)
            );
        } catch (IllegalArgumentException | SecurityException error) {
            publish(manualEstimate());
            return;
        }
        if (recorder.getState() != AudioRecord.STATE_INITIALIZED || recorder.getChannelCount() < 2) {
            releaseRecorder();
            publish(manualEstimate());
            return;
        }

        running = true;
        worker = new Thread(this::sample, "caption-lanes-direction");
        worker.setDaemon(true);
        worker.start();
    }

    void stop() {
        running = false;
        final AudioRecord active = recorder;
        if (active != null) {
            try {
                active.stop();
            } catch (IllegalStateException ignored) {
                // It may not have begun recording when a lifecycle stop arrives.
            }
        }
        releaseRecorder();
        worker = null;
        latest = manualEstimate();
    }

    private void sample() {
        final AudioRecord active = recorder;
        if (active == null) return;
        final short[] samples = new short[2048];
        DirectionEstimate lastSent = null;
        long lastSentAt = 0L;
        try {
            active.startRecording();
            while (running && recorder == active) {
                final int count = active.read(samples, 0, samples.length);
                if (count <= 0) continue;
                final DirectionEstimate estimate = fromInterleavedPcm(samples, count);
                if (estimate == null) continue;
                latest = estimate;
                final long now = android.os.SystemClock.elapsedRealtime();
                if (shouldPublish(lastSent, estimate, now - lastSentAt)) {
                    lastSent = estimate;
                    lastSentAt = now;
                    listener.onDirection(estimate);
                }
            }
        } catch (IllegalStateException | SecurityException error) {
            if (running) publish(manualEstimate());
        } finally {
            if (recorder == active) releaseRecorder();
        }
    }

    private boolean shouldPublish(DirectionEstimate previous, DirectionEstimate next, long elapsedMs) {
        return previous == null
            || !previous.lane.equals(next.lane)
            || Math.abs(previous.confidence - next.confidence) >= 0.08f
            || elapsedMs >= 1000L;
    }

    private void publish(DirectionEstimate estimate) {
        latest = estimate;
        listener.onDirection(estimate);
    }

    private void releaseRecorder() {
        final AudioRecord active = recorder;
        recorder = null;
        if (active != null) {
            try {
                active.release();
            } catch (IllegalStateException ignored) {
                // Releasing an already released recorder is harmless for this fallback.
            }
        }
    }

    static DirectionEstimate fromInterleavedPcm(short[] samples, int count) {
        if (count < 2) return null;
        double leftSquare = 0d;
        double rightSquare = 0d;
        int frames = 0;
        for (int index = 0; index + 1 < count; index += 2) {
            final double left = samples[index] / 32768d;
            final double right = samples[index + 1] / 32768d;
            leftSquare += left * left;
            rightSquare += right * right;
            frames += 1;
        }
        if (frames == 0) return null;
        return fromRms(Math.sqrt(leftSquare / frames), Math.sqrt(rightSquare / frames));
    }

    static DirectionEstimate fromRms(double leftRms, double rightRms) {
        final double total = leftRms + rightRms;
        if (total < MIN_SIGNAL) return null;
        final double balance = (rightRms - leftRms) / total;
        final String lane = balance < -DIRECTION_THRESHOLD ? "left"
            : balance > DIRECTION_THRESHOLD ? "right" : "center";
        final double confidence = lane.equals("center")
            ? 0.60d + ((DIRECTION_THRESHOLD - Math.abs(balance)) / DIRECTION_THRESHOLD) * 0.28d
            : 0.52d + Math.abs(balance);
        return new DirectionEstimate(lane, (float) Math.min(0.92d, Math.max(0.52d, confidence)), true, "");
    }

    static DirectionEstimate manualEstimate() {
        return new DirectionEstimate(
            "center",
            0f,
            false,
            "This Android microphone does not expose two usable channels. Automatic direction is off; choose Left, Centre, or Right for each speaker."
        );
    }
}
