// src/hooks/useOfflineWhisper.js
import { useEffect, useRef, useState } from "react";
import { pipeline } from "@xenova/transformers";

export function useOfflineWhisper(modelName = "Xenova/whisper-base") {
  const [loadingModel, setLoadingModel] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriberRef = useRef(null);
  const streamRef = useRef(null);

  // ------------ LOAD MODEL ONCE ------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        console.log("Loading Whisper model…");

        const transcriber = await pipeline(
          "automatic-speech-recognition",
          modelName
        );

        if (!cancelled) {
          transcriberRef.current = transcriber;   // SAVE callable fn
          console.log("Model ready");
        }
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        if (!cancelled) setLoadingModel(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      stop();
    };
  }, [modelName]);

  // ------------ START RECORDING ------------
  async function start() {
    if (loadingModel) return setError("Model still loading… wait a moment.");
    if (!transcriberRef.current)
      return setError("Transcriber not initialized yet.");
    if (listening) return;

    setListening(true);
    setError(null);

    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

    const rec = new MediaRecorder(streamRef.current, {
      mimeType: "audio/webm",
    });

    chunksRef.current = [];

    rec.ondataavailable = (e) => chunksRef.current.push(e.data);

    rec.onstop = async () => {
      try {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "audio.webm");
        const transcriber = transcriberRef.current;

        const result = await transcriber(file, { task: "transcribe" });

        setTranscript((t) => (t + " " + result.text).trim());
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    };

    recorderRef.current = rec;
    recorderRef.current.start();
  }

  // ------------ STOP ------------
  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setListening(false);
  }

  function reset() {
    setTranscript("");
  }

  return { loadingModel, listening, transcript, error, start, stop, reset };
}
