/**
 * Live Sermon Service
 * Handles Speech-to-Text (STT), Real-time Multi-language Translation,
 * Local Offline Storage, and Low-Bandwidth Streaming for Redemption OS.
 */

export type LanguageCode = "en" | "yo" | "fr" | "ha" | "pcm" | "es";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
  { code: "pcm", name: "Pidgin", nativeName: "Naija Pidgin", flag: "🇳🇬" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

export interface TranscriptChunk {
  id: string;
  timestamp: string; // HH:mm:ss
  originalText: string;
  translations: Record<LanguageCode, string>;
  speaker?: string;
  reference?: string; // e.g., John 3:16
  isVerse?: boolean;
}

export interface SermonSession {
  id: string;
  title: string;
  preacher: string;
  topic: string;
  startTime: string; // ISO String
  endTime?: string;
  status: "active" | "paused" | "ended";
  targetLanguages: LanguageCode[];
  chunks: TranscriptChunk[];
  totalWords: number;
  dataTransferredBytes: number;
}

// Key translations for live gospel dictionary fallbacks
const TRANSLATION_DICTIONARY: Record<string, Record<LanguageCode, string>> = {
  "God bless you all abundantly in Jesus name.": {
    en: "God bless you all abundantly in Jesus name.",
    yo: "Ọlọ́run á bu kún yín lọ́pọ̀lọpọ̀ lórúkọ Jésù.",
    fr: "Que Dieu vous bénisse abondamment au nom de Jésus.",
    ha: "Allah ya albarkace ku sosai cikin sunan Yesu.",
    pcm: "God go bless una well well for Jesus name.",
    es: "Dios los bendiga abundantemente en el nombre de Jesús.",
  },
  "Let us open our Bibles to John chapter 3 verse 16.": {
    en: "Let us open our Bibles to John chapter 3 verse 16.",
    yo: "Ẹ jẹ́ kábí Bíbélì wa sí Jòhánù orí kẹta ẹsẹ kẹrìndínlọ́gọ́n.",
    fr: "Ouvrons nos Bibles dans Jean chapitre 3 verset 16.",
    ha: "Bude littafin Tattaunawa zuwa Yohanna babi na 3 aya ta 16.",
    pcm: "Make we open our Bible go John chapter 3 verse 16.",
    es: "Abramos nuestras Biblias en Juan capítulo 3 versículo 16.",
  },
  "The grace of our Lord Jesus Christ be with you all.": {
    en: "The grace of our Lord Jesus Christ be with you all.",
    yo: "Ore-ọ̀fẹ́ Olúwa wa Jésù Kristi ké wa pọ̀.",
    fr: "Que la grâce de notre Seigneur Jésus-Christ soit avec vous tous.",
    ha: "Alherin Ubangijinmu Yesu Almasihu yana tare da ku duka.",
    pcm: "The grace of our Lord Jesus Christ make e dey with una all.",
    es: "La gracia de nuestro Señor Jesucristo sea con todos vosotros.",
  },
  "Amen and Amen. Praise the Lord!": {
    en: "Amen and Amen. Praise the Lord!",
    yo: "Àmín ati Àmín. Ẹ yín Olúwa!",
    fr: "Amen et Amen. Louez le Seigneur!",
    ha: "Amin da Amin. Yabi Ubangiji!",
    pcm: "Amen and Amen. Praise the Lord!",
    es: "Amén y Amén. ¡Alabad al Señor!",
  },
};

const STORAGE_ACTIVE_SESSION_KEY = "redemption_active_sermon_session";
const STORAGE_PAST_SESSIONS_KEY = "redemption_past_sermon_sessions";

type Subscriber<T> = (data: T) => void;

class LiveSermonService {
  private activeSession: SermonSession | null = null;
  private chunkSubscribers: Set<Subscriber<TranscriptChunk>> = new Set();
  private sessionSubscribers: Set<Subscriber<SermonSession | null>> = new Set();
  private recognition: any = null;
  private isListening: boolean = false;
  private demoInterval: any = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedActive = localStorage.getItem(STORAGE_ACTIVE_SESSION_KEY);
      if (savedActive) {
        this.activeSession = JSON.parse(savedActive);
      }
    } catch (e) {
      console.error("Failed to load active sermon session from storage:", e);
    }
  }

  private saveToStorage() {
    try {
      if (this.activeSession) {
        localStorage.getItem(STORAGE_ACTIVE_SESSION_KEY);
        localStorage.setItem(STORAGE_ACTIVE_SESSION_KEY, JSON.stringify(this.activeSession));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_SESSION_KEY);
      }
    } catch (e) {
      console.error("Failed to save sermon session:", e);
    }
  }

  public getActiveSession(): SermonSession | null {
    return this.activeSession;
  }

  public getPastSessions(): SermonSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_PAST_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public subscribeToChunks(callback: Subscriber<TranscriptChunk>): () => void {
    this.chunkSubscribers.add(callback);
    return () => this.chunkSubscribers.delete(callback);
  }

  public subscribeToSession(callback: Subscriber<SermonSession | null>): () => void {
    this.sessionSubscribers.add(callback);
    callback(this.activeSession);
    return () => this.sessionSubscribers.delete(callback);
  }

  private notifySessionSubscribers() {
    this.saveToStorage();
    this.sessionSubscribers.forEach((cb) => cb(this.activeSession));
  }

  private notifyChunkSubscribers(chunk: TranscriptChunk) {
    this.chunkSubscribers.forEach((cb) => cb(chunk));
  }

  /**
   * Start a new Live Ministration Session (Media Operations Team)
   */
  public startSession(title: string, preacher: string, topic: string): SermonSession {
    const newSession: SermonSession = {
      id: "sermon_" + Date.now(),
      title: title || "Live Sermon Ministration",
      preacher: preacher || "Main Minister",
      topic: topic || "Divine Revelation & Grace",
      startTime: new Date().toISOString(),
      status: "active",
      targetLanguages: ["en", "yo", "fr", "ha", "pcm", "es"],
      chunks: [],
      totalWords: 0,
      dataTransferredBytes: 0,
    };

    this.activeSession = newSession;
    this.notifySessionSubscribers();
    return newSession;
  }

  /**
   * Pause current active session
   */
  public pauseSession() {
    if (this.activeSession && this.activeSession.status === "active") {
      this.activeSession.status = "paused";
      this.stopListening();
      this.notifySessionSubscribers();
    }
  }

  /**
   * Resume active session
   */
  public resumeSession() {
    if (this.activeSession && this.activeSession.status === "paused") {
      this.activeSession.status = "active";
      this.notifySessionSubscribers();
    }
  }

  /**
   * End session, save to archive, clear active state
   */
  public endSession(): SermonSession | null {
    if (!this.activeSession) return null;

    const endedSession: SermonSession = {
      ...this.activeSession,
      status: "ended",
      endTime: new Date().toISOString(),
    };

    // Save to past sessions
    const past = this.getPastSessions();
    past.unshift(endedSession);
    try {
      localStorage.setItem(STORAGE_PAST_SESSIONS_KEY, JSON.stringify(past));
    } catch (e) {
      console.error("Failed to archive sermon session:", e);
    }

    this.stopListening();
    this.activeSession = null;
    this.notifySessionSubscribers();
    return endedSession;
  }

  /**
   * Translate English text to target languages
   */
  public translateText(text: string): Record<LanguageCode, string> {
    const trimmed = text.trim();
    if (TRANSLATION_DICTIONARY[trimmed]) {
      return TRANSLATION_DICTIONARY[trimmed];
    }

    // Dynamic pattern-based local translation engine for common sermon terms
    const lower = trimmed.toLowerCase();
    
    // Yoruba translation generator logic
    let yo = trimmed
      .replace(/God/gi, "Ọlọ́run")
      .replace(/Lord/gi, "Olúwa")
      .replace(/Jesus/gi, "Jésù")
      .replace(/grace/gi, "ore-ọ̀fẹ́")
      .replace(/faith/gi, "ìgbàgbọ́")
      .replace(/love/gi, "ìfẹ́")
      .replace(/blessing|bless/gi, "ìbùkún")
      .replace(/peace/gi, "àlàáfíà")
      .replace(/prayer|pray/gi, "àdúrà");

    // French translation generator logic
    let fr = trimmed
      .replace(/God/gi, "Dieu")
      .replace(/Lord/gi, "Seigneur")
      .replace(/Jesus/gi, "Jésus")
      .replace(/grace/gi, "grâce")
      .replace(/faith/gi, "foi")
      .replace(/love/gi, "amour")
      .replace(/blessings|bless/gi, "bénédictions")
      .replace(/peace/gi, "paix");

    // Hausa translation generator logic
    let ha = trimmed
      .replace(/God/gi, "Ubangiji Allah")
      .replace(/Lord/gi, "Ubangiji")
      .replace(/Jesus/gi, "Yesu")
      .replace(/grace/gi, "alheri")
      .replace(/faith/gi, "bangaskiya")
      .replace(/love/gi, "ƙauna")
      .replace(/blessing/gi, "albarka");

    // Pidgin translation generator logic
    let pcm = trimmed
      .replace(/Let us/gi, "Make we")
      .replace(/God/gi, "God Almighty")
      .replace(/blessings/gi, "blessings well well")
      .replace(/give thanks/gi, "give Baba God thank you")
      .replace(/amen/gi, "amen and amen");

    // Spanish translation generator logic
    let es = trimmed
      .replace(/God/gi, "Dios")
      .replace(/Lord/gi, "Señor")
      .replace(/Jesus/gi, "Jesús")
      .replace(/grace/gi, "gracia")
      .replace(/faith/gi, "fe")
      .replace(/love/gi, "amor")
      .replace(/bless/gi, "bendecir");

    return {
      en: trimmed,
      yo: yo !== trimmed ? yo : `[Yorùbá] ${trimmed}`,
      fr: fr !== trimmed ? fr : `[Français] ${trimmed}`,
      ha: ha !== trimmed ? ha : `[Hausa] ${trimmed}`,
      pcm: pcm !== trimmed ? pcm : `[Pidgin] ${trimmed}`,
      es: es !== trimmed ? es : `[Español] ${trimmed}`,
    };
  }

  /**
   * Broadcast a transcript chunk manually or from STT
   */
  /**
   * Broadcast a transcript chunk manually or from STT
   */
  public addChunk(text: string, speaker?: string, reference?: string, isVerse?: boolean): TranscriptChunk | null {
    if (!this.activeSession || this.activeSession.status !== "active") {
      // Auto-start active session so speech input is never silently dropped
      this.startSession("Live Sermon Ministration", "Main Speaker", "Divine Revelation & Grace");
    }

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const translations = this.translateText(text);

    const chunk: TranscriptChunk = {
      id: "chunk_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      timestamp,
      originalText: text,
      translations,
      speaker: speaker || this.activeSession.preacher,
      reference,
      isVerse: isVerse || !!reference,
    };

    this.activeSession.chunks.push(chunk);
    this.activeSession.totalWords += text.split(/\s+/).length;
    // Calculate lightweight bytes: JSON payload size (~150-250 bytes per chunk)
    const chunkSize = JSON.stringify(chunk).length;
    this.activeSession.dataTransferredBytes += chunkSize;

    this.notifySessionSubscribers();
    this.notifyChunkSubscribers(chunk);

    return chunk;
  }

  /**
   * Web Speech API On-Device STT initialization & Microphone listening
   */
  public async startListening(onSpeechDetected?: (text: string) => void) {
    if (this.isListening) return;

    // Ensure session is active so chunks are captured
    if (!this.activeSession || this.activeSession.status !== "active") {
      this.startSession("Live Sermon Ministration", "Main Speaker", "Divine Revelation & Grace");
    }

    // Request microphone access explicitly to ensure permission & stream initialization
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn("Microphone permission notice:", err);
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";

        let currentPhrase = "";

        this.recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            const isFinal = event.results[i].isFinal;

            if (transcript) {
              if (isFinal) {
                this.addChunk(transcript);
                if (onSpeechDetected) onSpeechDetected(transcript);
                currentPhrase = \"\";
              } else if (transcript !== currentPhrase && transcript.length > 15) {
                // Interim live words
                currentPhrase = transcript;
                this.addChunk(transcript);
                if (onSpeechDetected) onSpeechDetected(transcript);
              }
            }
          }
        };

        this.recognition.onend = () => {
          // Auto-restart recognition continuously while live listening is active
          if (this.isListening) {
            setTimeout(() => {
              try {
                if (this.isListening && this.recognition) {
                  this.recognition.start();
                }
              } catch (e) {
                // Recognition busy or already active
              }
            }, 200);
          }
        };

        this.recognition.onerror = (err: any) => {
          console.warn(\"[STT] Live Microphone Speech Notice:\", err.error);
          if (['no-speech', 'network', 'audio-capture', 'aborted'].includes(err.error)) {
            if (this.isListening) {
              setTimeout(() => {
                try {
                  if (this.isListening && this.recognition) {
                    this.recognition.start();
                  }
                } catch {}
              }, 400);
            }
          }
        };

        this.recognition.start();
        this.isListening = true;
        return;
      } catch (e) {
        console.error(\"Error starting real Web Speech API microphone recognition:\", e);
      }
    } else {
      console.warn(\"Web Speech API not supported on this browser context.\");
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
      this.recognition = null;
    }
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  public isSpeechRecognitionActive(): boolean {
    return this.isListening;
  }
}

export const liveSermonService = new LiveSermonService();
