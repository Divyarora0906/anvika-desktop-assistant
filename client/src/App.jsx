import React, { useState } from "react";
import img from "/Anvika.png";
import "./App.css";
import { useOfflineWhisper } from "./hooks/useOfflineWhisper";

const App = () => {
  const [awake, setAwake] = useState(false);

  const { loadingModel, listening, transcript, error, start, stop, reset } =
    useOfflineWhisper("Xenova/whisper-base");

  return (
    <>
      <div>
        <img
          src={img}
          alt=""
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

        <button id="Awake" onClick={() => setAwake(true)}>
          Awake
        </button>

        <button id="Sleep" onClick={() => setAwake(false)}>
          Sleep
        </button>

        <br />

        <button disabled={loadingModel || listening} onClick={start}>
          🎤 Start Listening
        </button>

        <button disabled={!listening} onClick={stop}>
          🛑 Stop
        </button>
        {loadingModel && <p>Loading offline model… ⏳</p>}
        <button onClick={reset}>♻ Reset Transcript</button>

        <h3>Transcript:</h3>
        <p>{transcript}</p>
      </div>
    </>
  );
};

export default App;
