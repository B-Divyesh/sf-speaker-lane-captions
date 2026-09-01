package in.sociobot.speakerlanecaptions;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/** Regression coverage for native left/centre/right classification and mono fallback. */
public class DirectionEstimatorTest {
    @Test
    public void classifiesLeftCentreAndRightWithConfidence() {
        DirectionEstimator.DirectionEstimate left = DirectionEstimator.fromRms(0.30d, 0.04d);
        DirectionEstimator.DirectionEstimate center = DirectionEstimator.fromRms(0.20d, 0.20d);
        DirectionEstimator.DirectionEstimate right = DirectionEstimator.fromRms(0.04d, 0.30d);

        assertEquals("left", left.lane);
        assertEquals("center", center.lane);
        assertEquals("right", right.lane);
        assertTrue(left.automatic && center.automatic && right.automatic);
        assertTrue(left.confidence >= 0.60f);
        assertTrue(center.confidence >= 0.80f);
        assertTrue(right.confidence >= 0.60f);
    }

    @Test
    public void classifiesInterleavedPcmWithoutRetainingSamples() {
        short[] samples = { 12000, 1000, 11000, 1200, 10000, 900, 9000, 1100 };
        DirectionEstimator.DirectionEstimate estimate = DirectionEstimator.fromInterleavedPcm(samples, samples.length);

        assertNotNull(estimate);
        assertEquals("left", estimate.lane);
        assertTrue(estimate.automatic);
    }

    @Test
    public void exposesManualFallbackForMonoOrUnavailableInput() {
        DirectionEstimator.DirectionEstimate fallback = DirectionEstimator.manualEstimate();

        assertFalse(fallback.automatic);
        assertEquals("center", fallback.lane);
        assertEquals(0f, fallback.confidence, 0f);
        assertTrue(fallback.message.contains("two usable channels"));
    }
}
