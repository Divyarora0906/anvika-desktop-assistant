import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

let transcriber = null;

export async function getTranscriber() {
  if (!transcriber) {
    console.log("⏳ Loading Whisper Base English model...");
    const device = "gpu" in navigator ? "webgpu" : "wasm";

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-base.en", 
      { 
        device: device,
        progress_callback: (p) => {
          if (p.status === "progress") {
            console.log(`🚀 Model Load: ${p.progress.toFixed(1)}%`);
          }
        },
      }
    );

    console.log(`✅ Whisper ready (using ${device})`);
  }

  return transcriber;
}