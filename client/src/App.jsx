import React, { useEffect } from "react";
import img from "/Anvika.png";
import "./App.css";
import { useAssistant } from "./hooks/WakeWord";

export default function App() {
  // Use our new master hook instead of the raw whisper hook
  const {
    transcript,
    listening,
    isAwake,      // true after "Hey Anvika" is heard
    voskReady,    // true when the wake-word engine is active
    loadingModel, // true when Whisper GPU is loading
    error,
    reset,
  } = useAssistant();

  // Log to console for debugging the "Yes Sir" handshake
  useEffect(() => {
    if (isAwake) {
      console.log("Anvika is now ACTIVE and listening for commands.");
    }
  }, [isAwake]);

  return (
    <div className="container">
      {/* 1. The Dynamic Image */}
      <div className="avatar-container">
        <img
          src={img}
          id="anvika_img"
          // "awake" class can trigger a CSS glow or pulse
          className={isAwake ? "awake pulse" : "sleep grayscale"}
          alt="Anvika AI"
        />
        <div className={`status-ring ${isAwake ? "active" : ""}`}></div>
      </div>

      {/* 2. Real-time Status */}
      <div className="status-box">
        <p className="status-text">
          {!voskReady ? "⚙️ Initializing Engine..." : 
           loadingModel ? "🧠 Loading Whisper (GPU)..." : 
           listening ? "🎤 Listening to you, Sir..." : 
           "💤 Sleeping (Say 'Hey Anvika')"}
        </p>
      </div>

      {/* 3. Error Handling */}
      {error && <p className="error-message">⚠️ {error}</p>}

      {/* 4. The Transcript (Hindi/English) */}
      <div className="transcript-container">
        <h3>Transcript</h3>
        <div className="transcript-content">
          {transcript || (isAwake ? "..." : "Waiting for 'Hey Anvika'...")}
        </div>
      </div>

      {/* 5. Manual Controls (Optional) */}
      <div className="controls">
        <button className="btn-reset" onClick={reset}>
          ♻ Reset Conversation
        </button>
      </div>

      {/* 6. Power Note */}
      <footer className="footer">
        {isAwake ? "GPU Active" : "Power Saving: GPU Idle"}
      </footer>
    </div>
  );
}