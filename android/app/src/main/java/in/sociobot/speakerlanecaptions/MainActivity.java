package in.sociobot.speakerlanecaptions;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(NativeCaptionPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
