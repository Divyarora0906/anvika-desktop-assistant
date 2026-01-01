import { useState, useEffect, useCallback, useRef } from "react";
import { useWhisperSTT } from "./useOfflineWhisper";
import * as Vosk from "vosk-browser";

export function useAssistant() {
  const whisper = useWhisperSTT();
  const [isAwake, setIsAwake] = useState(false);
  const [voskReady, setVoskReady] = useState(false);
  const [partial, setPartial] = useState(""); 
  
  const recognizerRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    async function initVosk() {
      try {
        // Only load the model once
        if (!modelRef.current) {
          modelRef.current = await Vosk.createModel("/modelvosk.zip");
        }

        const grammar = ["hey anvika", "anvika", "hey annika", "annika", "अन्विका", "अनिका", "[unknown]"];
        const recognizer = new modelRef.current.KaldiRecognizer(16000, JSON.stringify(grammar));
        recognizerRef.current = recognizer;

        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true } 
        });
        
        const ctx = new AudioContext({ sampleRate: 16000 });
        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          // If we've detected the wake word, we stop sending audio to Vosk
          if (!isAwake && recognizerRef.current) {
            recognizerRef.current.acceptWaveform(e.inputBuffer);
          }
        };

        recognizer.on("partialresult", (msg) => {
          const text = msg.result.partial.toLowerCase();
          setPartial(text);

          const triggerWords = ["anvika", "anika", "annika", "अन्विका", "अनिका"];
          if (triggerWords.some(word => text.includes(word))) {
            console.log("Wake Word Detected:", text);
            
            // FIX: Instead of .reset(), we set partial empty and trigger wake-up.
            // We ignore further results by checking 'isAwake' in onaudioprocess.
            setPartial("");
            handleWakeUp();
          }
        });

        source.connect(processor);
        processor.connect(ctx.destination);
        setVoskReady(true);
      } catch (err) {
        console.error("Vosk Init Error:", err);
      }
    }

    if (!voskReady) initVosk();
  }, [isAwake, voskReady]);

  const handleWakeUp = useCallback(() => {
    if (isAwake) return;
    
    setIsAwake(true);
    const audio = new Audio("/yes_sir.mp3");
    
    audio.onended = () => whisper.start();
    audio.play().catch(() => whisper.start());
  }, [whisper, isAwake]);

  // RESET LOGIC: When whisper is done, allow Vosk to listen again
  useEffect(() => {
    if (!whisper.listening && isAwake && whisper.transcript) {
      const timer = setTimeout(() => {
        setIsAwake(false); // This allows onaudioprocess to feed Vosk again
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [whisper.listening, whisper.transcript, isAwake]);

  return { ...whisper, isAwake, voskReady, partial };
}