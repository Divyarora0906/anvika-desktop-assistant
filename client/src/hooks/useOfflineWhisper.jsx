import { useRef, useState } from "react";
import { getTranscriber } from "./whisper";

export function useWhisperSTT() {
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const silenceTimerRef = useRef(null);

  async function start() {
    if (listening) return;
    setLoading(true);
    setListening(true);

    const transcriber = await getTranscriber();
    setLoading(false);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000 },
    });
    streamRef.current = stream;

    // --- Silence Detection Logic ---
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkSilence = () => {
      if (!streamRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

      if (volume < 15) { // Threshold for silence
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => stop(), 2000); // Stop after 2s silence
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
      requestAnimationFrame(checkSilence);
    };
    checkSilence();
    // -------------------------------

    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;
    chunksRef.current = [];

    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const audioData = await blob.arrayBuffer().then(buf => audioContext.decodeAudioData(buf));
      const result = await transcriber(audioData.getChannelData(0));
      setTranscript(result.text.trim());
      audioContext.close();
    };

    rec.start();
  }

  function stop() {
    if (recorderRef.current?.state !== "inactive") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setListening(false);
  }

  return { loading, listening, transcript, start, stop };
}