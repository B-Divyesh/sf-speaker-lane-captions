export interface SpeechCaption {
  text: string;
  confidence: number | null;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string; confidence: number } }>;
}

interface SpeechRecognitionErrorLike extends Event { error: string; message?: string }

interface RecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  processLocally?: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => RecognitionLike;

export class OnDeviceSpeech {
  private recognition: RecognitionLike | null = null;
  private wanted = false;

  constructor(
    private onCaption: (caption: SpeechCaption) => void,
    private onError: (message: string) => void,
    private onState: (listening: boolean) => void
  ) {}

  supported(): boolean {
    return Boolean(this.constructorForBrowser());
  }

  start(): boolean {
    const Constructor = this.constructorForBrowser();
    if (!Constructor) return false;
    this.wanted = true;
    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';
    // Chromium's on-device mode. If unsupported, do not silently opt into server speech.
    if (!('processLocally' in recognition)) {
      this.onError('This browser cannot guarantee on-device speech. Use typed captions or install the Android app on a supported device.');
      this.wanted = false;
      return false;
    }
    recognition.processLocally = true;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result.isFinal) continue;
        const alternative = result[0];
        const text = alternative.transcript.trim();
        if (text) this.onCaption({ text, confidence: Number.isFinite(alternative.confidence) ? alternative.confidence : null });
      }
    };
    recognition.onerror = (event) => {
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone permission was denied. Allow microphone access in Android settings, or use typed captions.',
        'language-not-supported': 'The on-device language pack is not installed for this language.',
        'audio-capture': 'No microphone was found. Check the device microphone and try again.',
        network: 'On-device speech could not start. Install the language pack while online, then retry.'
      };
      this.onError(messages[event.error] || 'Captions stopped unexpectedly. Try starting again.');
    };
    recognition.onend = () => {
      this.onState(false);
      if (this.wanted) window.setTimeout(() => {
        try { recognition.start(); this.onState(true); } catch { this.wanted = false; }
      }, 250);
    };
    this.recognition = recognition;
    try {
      recognition.start();
      this.onState(true);
      return true;
    } catch {
      this.onError('On-device captions could not start. Close other apps using the microphone and retry.');
      return false;
    }
  }

  stop(): void {
    this.wanted = false;
    this.recognition?.stop();
    this.recognition = null;
    this.onState(false);
  }

  private constructorForBrowser(): RecognitionConstructor | undefined {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
  }
}
