import React, { useState } from "react";
import img from "/Anvika.png";
import "./App.css";
import { useWhisperSTT } from "./hooks/useOfflineWhisper";

export default function App() {
  const [awake, setAwake] = useState(false);

  const {
    loadingModel,
    listening,
    transcript,
    error,
    start,
    stop,
    reset,
  } = useWhisperSTT("Xenova/whisper-base");

  return (
    <div>
      <img
        src={img}
        id="anvika_img"
        className={awake ? "awake" : "sleep"}
      />

      <p>
        {loadingModel
          ? "Loading offline model…"
          : listening
          ? "Listening…"
          : "Idle"}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={() => setAwake(true)}>Awake</button>
      <button onClick={() => setAwake(false)}>Sleep</button>

      <br />

      <button disabled={loadingModel || listening} onClick={start}>
        🎤 Start Listening
      </button>

      <button disabled={!listening} onClick={stop}>
        🛑 Stop
      </button>

      <button onClick={reset}>♻ Reset Transcript</button>

      <h3>Transcript:</h3>
      <p>{transcript}</p>
    </div>
  );
}
