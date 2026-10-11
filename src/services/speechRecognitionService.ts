// ============================================================
// SPEECH RECOGNITION SERVICE
// ============================================================
//
// Frontend-only voice-to-text adapter.
//
// IMPORTANT:
// - No backend dependency
// - No manager-agent dependency
// - No business logic
// - It only converts microphone speech -> text
//
// Composer receives the text and uses the existing
// normal prompt submission pipeline.
// ============================================================


// ============================================================
// BROWSER SPEECH RECOGNITION TYPES
// ============================================================

interface SpeechRecognitionEventLike
  extends Event {

  // Index where the latest recognition result starts
  resultIndex: number;

  // All recognition results
  results: SpeechRecognitionResultList;
}


interface SpeechRecognitionErrorEventLike
  extends Event {
  error: string;
  message?: string;
}


interface SpeechRecognitionInstance
  extends EventTarget {

  continuous: boolean;

  interimResults: boolean;

  lang: string;

  start(): void;

  stop(): void;

  abort(): void;

  onstart:
    | (() => void)
    | null;

  onend:
    | (() => void)
    | null;

  onresult:
    | ((
        event:
          SpeechRecognitionEventLike
      ) => void)
    | null;

  onerror:
    | ((
        event:
          SpeechRecognitionErrorEventLike
      ) => void)
    | null;
}


interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}


// ============================================================
// WINDOW EXTENSION
// ============================================================

declare global {
  interface Window {
    SpeechRecognition?:
      SpeechRecognitionConstructor;

    webkitSpeechRecognition?:
      SpeechRecognitionConstructor;
  }
}


// ============================================================
// CALLBACK CONTRACT
// ============================================================

export interface SpeechRecognitionCallbacks {

  onStart?: () => void;

  onInterimText?: (
    text: string
  ) => void;

  onFinalText?: (
    text: string
  ) => void;

  onEnd?: () => void;

  onError?: (
    message: string
  ) => void;
}


// ============================================================
// CHECK BROWSER SUPPORT
// ============================================================

export function
isSpeechRecognitionSupported():
boolean {

  return Boolean(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition
  );
}


// ============================================================
// FRIENDLY ERROR MESSAGE
// ============================================================

function getFriendlySpeechError(
  error: string
): string {

  switch (error) {

    case "not-allowed":
    case "service-not-allowed":

      return (
        "Microphone access was denied. " +
        "Please allow microphone permission and try again."
      );


    case "no-speech":

      return (
        "I couldn't detect any speech. " +
        "Please try speaking again."
      );


    case "audio-capture":

      return (
        "No microphone was detected. " +
        "Please check your microphone connection."
      );


    case "network":

      return (
        "Speech recognition is temporarily unavailable. " +
        "Please try again."
      );


    case "aborted":

      return (
        "Voice input was stopped."
      );


    default:

      return (
        "Voice input could not be processed. " +
        "Please try again."
      );
  }
}


// ============================================================
// CREATE SPEECH RECOGNITION SESSION
// ============================================================

export function createSpeechRecognition(
  callbacks:
    SpeechRecognitionCallbacks,

  language = "en-US"
) {

  const SpeechRecognitionAPI =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognitionAPI) {

    callbacks.onError?.(
      "Voice input is not supported in this browser."
    );

    return null;
  }


  const recognition =
    new SpeechRecognitionAPI();


  // ----------------------------------------------------------
  // We want the user to speak naturally
  // until they stop or click Mic again.
  // ----------------------------------------------------------

  recognition.continuous = true;


  // ----------------------------------------------------------
  // Interim results allow text to appear
  // while the user is still speaking.
  // ----------------------------------------------------------

  recognition.interimResults = true;


  // Default language
  recognition.lang =
    language;


  // ==========================================================
  // START
  // ==========================================================

  recognition.onstart = () => {

    callbacks.onStart?.();

  };


  // ==========================================================
  // RESULTS
  // ==========================================================

  recognition.onresult = (
    event:
      SpeechRecognitionEventLike
  ) => {

    let interimText = "";

    let finalText = "";


    for (
      let index =
        event.resultIndex;

      index <
        event.results.length;

      index++
    ) {

      const result =
        event.results[index];


      const transcript =
        result[0]?.transcript || "";


      if (
        result.isFinal
      ) {

        finalText +=
          transcript;

      } else {

        interimText +=
          transcript;

      }
    }


    if (interimText) {

      callbacks.onInterimText?.(
        interimText
      );

    }


    if (finalText) {

      callbacks.onFinalText?.(
        finalText
      );

    }

  };


  // ==========================================================
  // ERROR
  // ==========================================================

  recognition.onerror = (
    event:
      SpeechRecognitionErrorEventLike
  ) => {

    callbacks.onError?.(
      getFriendlySpeechError(
        event.error
      )
    );

  };


  // ==========================================================
  // END
  // ==========================================================

  recognition.onend = () => {

    callbacks.onEnd?.();

  };


  return recognition;
}