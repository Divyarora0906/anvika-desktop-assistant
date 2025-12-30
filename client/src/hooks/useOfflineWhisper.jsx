import { useRef, useState } from "react";
import { getTranscriber } from "./whisper";

function cleanTranscript(text) {
  return text
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function useWhisperSTT() {
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  async function start() {
    try {
      if (listening) return;

      setError("");
      setLoading(true);
      setListening(true);

      const transcriber = await getTranscriber();
      setLoading(false);

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const rec = new MediaRecorder(streamRef.current);
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (blob.size < 3000) {
            setError("Audio too short.");
            return;
          }

          const arrayBuffer = await blob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000,
          });

          const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
          const audioData = decodedData.getChannelData(0);

          // FIXED: Removed 'language' and 'task' for the .en model
          const result = await transcriber(audioData, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: false,
            num_beams: 5, 
            temperature: 0.0, 
          });

          const cleanText = cleanTranscript(result.text);
          if (cleanText) {
            setTranscript((t) => (t + " " + cleanText).trim());
          }
          
          await audioCtx.close();
        } catch (err) {
          console.error("Transcription Error:", err);
          setError("Processing failed. Please try again.");
        }
      };

      rec.start();
    } catch (err) {
      console.error("Mic/Model Error:", err);
      setError("Microphone access denied or model failed to load.");
      setListening(false);
      setLoading(false);
    }
  }

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
    setError("");
  }

  return { loading, listening, transcript, error, start, stop, reset };
}