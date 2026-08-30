package in.sociobot.speakerlanecaptions;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayList;

/**
 * Android's on-device recognizer is separate from the WebView speech API. We
 * deliberately use createOnDeviceSpeechRecognizer (API 31+) rather than the
 * network-capable default recognizer, so the native app fails closed when an
 * installed local language model is unavailable.
 */
@CapacitorPlugin(
    name = "NativeCaption",
    permissions = { @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO }) }
)
public class NativeCaptionPlugin extends Plugin {
    private SpeechRecognizer recognizer;
    private boolean listening = false;

    @PluginMethod
    public void availability(PluginCall call) {
        JSObject result = new JSObject();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            result.put("available", false);
            result.put("message", "On-device captions need Android 12 or newer. Use typed captions instead.");
        } else if (!SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
            result.put("available", false);
            result.put("message", "This device has no on-device speech language installed. Add one in Android settings, then try again.");
        } else {
            result.put("available", true);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || !SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
            call.reject("On-device Android speech is unavailable. Use typed captions instead.");
            return;
        }
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("microphone", call, "microphonePermissionResult");
            return;
        }
        startRecognizer(call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopRecognizer();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        stopRecognizer();
        super.handleOnDestroy();
    }

    @Override
    protected void handleOnPause() {
        stopRecognizer();
        super.handleOnPause();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
    }

    @SuppressWarnings("unused")
    private void microphonePermissionResult(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            startRecognizer(call);
        } else {
            call.reject("Microphone permission was denied. Allow it in Android settings, or use typed captions.");
        }
    }

    private void startRecognizer(PluginCall call) {
        stopRecognizer();
        recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(android.os.Bundle params) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onPartialResults(android.os.Bundle partialResults) { }
            @Override public void onEvent(int eventType, android.os.Bundle params) { }

            @Override public void onResults(android.os.Bundle results) {
                emitBestResult(results);
                restartIfListening();
            }

            @Override public void onError(int error) {
                if (!listening) return;
                JSObject event = new JSObject();
                event.put("message", errorMessage(error));
                notifyListeners("error", event);
                // Recognition services naturally finish after each phrase. A
                // transient no-match or timeout should not require a second tap.
                if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) restartIfListening();
                else stopRecognizer();
            }
        });
        listening = true;
        recognizer.startListening(recognizerIntent());
        call.resolve();
    }

    private Intent recognizerIntent() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, java.util.Locale.getDefault().toLanguageTag());
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        return intent;
    }

    private void emitBestResult(android.os.Bundle results) {
        ArrayList<String> values = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (values == null || values.isEmpty() || values.get(0).trim().isEmpty()) return;
        JSObject event = new JSObject();
        event.put("text", values.get(0).trim());
        float[] confidence = results.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES);
        event.put("confidence", confidence != null && confidence.length > 0 && confidence[0] >= 0 ? confidence[0] : null);
        notifyListeners("caption", event);
    }

    private void restartIfListening() {
        if (listening && recognizer != null) recognizer.startListening(recognizerIntent());
    }

    private void stopRecognizer() {
        listening = false;
        if (recognizer != null) {
            recognizer.cancel();
            recognizer.destroy();
            recognizer = null;
        }
    }

    private String errorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "Microphone permission was denied. Allow it in Android settings, or use typed captions.";
            case SpeechRecognizer.ERROR_AUDIO: return "Android could not open the microphone. Close another app using it, then try again.";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "On-device captions are unavailable until an Android language model is installed.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: return "Android speech is busy. Stop captions in another app, then try again.";
            default: return "On-device captions stopped. Start captions again or use typed captions.";
        }
    }
}
