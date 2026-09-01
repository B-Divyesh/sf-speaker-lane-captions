package in.sociobot.speakerlanecaptions;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.json.JSONObject;
import org.json.JSONTokener;

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
            JSONObject response = responseObject(invokeWhenBridgeReady(scenario, "availability"));
            assertTrue("Bridge did not return an availability object: " + response, response.has("available"));
        }
    }

    @Test
    public void exposesDirectionalConfidenceAndMonoFallbackThroughThePackagedBridge() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            JSONObject probe = responseObject(invokeWhenBridgeReady(scenario, "directionProbe"));
            assertAutomaticLane(probe.getJSONObject("left"), "left");
            assertAutomaticLane(probe.getJSONObject("center"), "center");
            assertAutomaticLane(probe.getJSONObject("right"), "right");
            JSONObject mono = probe.getJSONObject("mono");
            assertFalse("Mono input must expose the manual fallback", mono.getBoolean("automatic"));
            assertEquals("Mono fallback confidence must be zero", 0d, mono.getDouble("confidence"), 0d);
            assertTrue("Mono fallback must explain the next step", mono.has("message"));
        }
    }

    private String invokeWhenBridgeReady(ActivityScenario<MainActivity> scenario, String method) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> response = new AtomicReference<>();
        String script = "(async()=>{const deadline=Date.now()+12000;"
            + "const header=()=>window.Capacitor&&Array.isArray(window.Capacitor.PluginHeaders)&&"
            + "window.Capacitor.PluginHeaders.some(plugin=>plugin.name==='NativeCaption'&&"
            + "plugin.methods.some(entry=>entry.name==='" + method + "'));"
            + "while(!(window.Capacitor&&window.Capacitor.nativePromise&&header())){"
            + "if(Date.now()>deadline)return JSON.stringify({error:'NativeCaption bridge did not initialize'});"
            + "await new Promise(resolve=>setTimeout(resolve,50));}"
            + "try{return JSON.stringify(await window.Capacitor.nativePromise('NativeCaption','" + method + "',{}));}"
            + "catch(error){return JSON.stringify({error:String(error)});}})()";
        scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(
            script,
            value -> { response.set(value); latch.countDown(); }
        ));
        assertTrue("NativeCaption " + method + " never returned", latch.await(15, TimeUnit.SECONDS));
        return response.get();
    }

    private JSONObject responseObject(String callbackValue) throws Exception {
        Object decoded = new JSONTokener(callbackValue).nextValue();
        return decoded instanceof String ? new JSONObject((String) decoded) : (JSONObject) decoded;
    }

    private void assertAutomaticLane(JSONObject direction, String lane) throws Exception {
        assertEquals("Packaged bridge reported the wrong lane", lane, direction.getString("lane"));
        assertTrue("Packaged bridge must mark " + lane + " as automatic", direction.getBoolean("automatic"));
        assertTrue("Packaged bridge must provide positive confidence for " + lane, direction.getDouble("confidence") > 0d);
    }
}
