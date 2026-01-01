import { pipeline, env } from "@huggingface/transformers";
env.allowLocalModels = false; 

let transcriber = null;

export async function getTranscriber() {
  if (!transcriber) {
    console.log("⏳ Loading Whisper...");
    const device = "gpu" in navigator ? "webgpu" : "wasm";

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny", // Tiny is best for fast, multilingual (Hindi) response
      { 
        device: device,
        progress_callback: (p) => {
          if (p.status === "progress") console.log(`Model: ${p.progress.toFixed(1)}%`);
        },
      }
    );
    console.log(`✅ Whisper ready on ${device}`);
  }
  return transcriber;
}