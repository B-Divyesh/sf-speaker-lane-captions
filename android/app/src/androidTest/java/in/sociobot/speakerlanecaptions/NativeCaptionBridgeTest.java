package in.sociobot.speakerlanecaptions;

import static org.junit.Assert.assertTrue;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * @claim:android-native-caption-path Device test: exercise the actual Capacitor bridge in the packaged Android
 * WebView. The JSON may report unavailable when the emulator/device has no
 * downloaded on-device language, which is the intended fail-closed state.
 */
@RunWith(AndroidJUnit4.class)
public class NativeCaptionBridgeTest {
    @Test
    public void exposesTheOnDeviceCaptionAvailabilityBridge() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            CountDownLatch latch = new CountDownLatch(1);
            AtomicReference<String> response = new AtomicReference<>();
            scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(
                "(async()=>JSON.stringify(await window.Capacitor.Plugins.NativeCaption.availability()))()",
                value -> { response.set(value); latch.countDown(); }
            ));
            assertTrue("NativeCaption availability never returned", latch.await(15, TimeUnit.SECONDS));
            assertTrue("Bridge did not return an availability object", response.get().contains("available"));
        }
    }

    @Test
    public void exposesDirectionalConfidenceAndMonoFallbackThroughThePackagedBridge() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            CountDownLatch latch = new CountDownLatch(1);
            AtomicReference<String> response = new AtomicReference<>();
            scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(
                "(async()=>JSON.stringify(await window.Capacitor.Plugins.NativeCaption.directionProbe()))()",
                value -> { response.set(value); latch.countDown(); }
            ));
            assertTrue("NativeCaption direction probe never returned", latch.await(15, TimeUnit.SECONDS));
            String probe = response.get();
            assertTrue("Bridge did not report automatic left", probe.contains("\\\"left\\\"") && probe.contains("\\\"automatic\\\":true"));
            assertTrue("Bridge did not report centre", probe.contains("\\\"center\\\""));
            assertTrue("Bridge did not report right", probe.contains("\\\"right\\\""));
            assertTrue("Bridge did not report the mono/manual fallback", probe.contains("\\\"mono\\\"") && probe.contains("\\\"automatic\\\":false"));
        }
    }
}
