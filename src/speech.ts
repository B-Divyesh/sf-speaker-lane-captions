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

type RecognitionConstructor = (new () => RecognitionLike) & {
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  install?: (options: { langs: string[] }) => Promise<boolean>;
};

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

  async start(): Promise<boolean> {
    const Constructor = this.constructorForBrowser();
    if (!Constructor) return false;
    const recognition = new Constructor();
    const language = navigator.language || 'en-US';
    // Chromium's on-device mode. If unsupported, do not silently opt into server speech.
    if (!('processLocally' in recognition)) {
      this.onError('This browser cannot guarantee on-device speech. Use typed captions instead.');
      this.wanted = false;
      return false;
    }
    if (Constructor.available) {
      try {
        const availability = await Constructor.available({ langs: [language], processLocally: true });
        if (availability === 'unavailable') {
          this.onError(`On-device captions are not available for ${language}. Use typed captions or change Android's speech language.`);
          return false;
        }
        if (availability === 'downloadable' || availability === 'downloading') {
          this.onState(false);
          if (!Constructor.install || !await Constructor.install({ langs: [language] })) {
            this.onError('The on-device language pack was not installed. Connect once, then start captions and accept the language download.');
            return false;
          }
        }
      } catch {
        this.onError('The on-device language pack could not be checked. Use typed captions and try again after reconnecting.');
        return false;
      }
    }
    this.wanted = true;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;
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
        'not-allowed': 'Microphone permission was denied. Allow microphone access in your device settings, or use typed captions.',
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
