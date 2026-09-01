package in.sociobot.speakerlanecaptions;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // BridgeActivity creates the Capacitor bridge in super.onCreate().
        // Register afterwards so the packaged WebView exposes NativeCaption,
        // rather than resolving calls through an empty unregistered proxy.
        registerPlugin(NativeCaptionPlugin.class);
    }
}
