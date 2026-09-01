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
            String response = invokeWhenBridgeReady(scenario, "availability");
            assertTrue("Bridge did not return an availability object: " + response, response.contains("available"));
        }
    }

    @Test
    public void exposesDirectionalConfidenceAndMonoFallbackThroughThePackagedBridge() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            String probe = invokeWhenBridgeReady(scenario, "directionProbe");
            assertTrue("Bridge did not report automatic left", probe.contains("\\\"left\\\"") && probe.contains("\\\"automatic\\\":true"));
            assertTrue("Bridge did not report centre", probe.contains("\\\"center\\\""));
            assertTrue("Bridge did not report right", probe.contains("\\\"right\\\""));
            assertTrue("Bridge did not report the mono/manual fallback", probe.contains("\\\"mono\\\"") && probe.contains("\\\"automatic\\\":false"));
        }
    }

    private String invokeWhenBridgeReady(ActivityScenario<MainActivity> scenario, String method) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> response = new AtomicReference<>();
        String script = "(async()=>{const deadline=Date.now()+12000;"
            + "while(!(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.NativeCaption)){"
            + "if(Date.now()>deadline)return JSON.stringify({error:'NativeCaption bridge did not initialize'});"
            + "await new Promise(resolve=>setTimeout(resolve,50));}"
            + "try{return JSON.stringify(await window.Capacitor.Plugins.NativeCaption." + method + "());}"
            + "catch(error){return JSON.stringify({error:String(error)});}})()";
        scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(
            script,
            value -> { response.set(value); latch.countDown(); }
        ));
        assertTrue("NativeCaption " + method + " never returned", latch.await(15, TimeUnit.SECONDS));
        return response.get();
    }
}
