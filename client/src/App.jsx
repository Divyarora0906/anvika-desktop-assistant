import React from "react";
import img from "/Anvika.png";
import "./App.css";
import { useState } from "react";
import WebSpeech from "./WebSpeech";
const App = () => {
    const [awake, setawake] = useState(false);
    const AwakeHer = () =>{
      setawake(true);
    }
    const MakeHerSleep = () => {
      setawake(false);
    }
  return (
    <>
      <div>
        <WebSpeech />
        <img src={img} alt="" id="anvika_img" className= {awake ? "awake" : "sleep"}/>
        <button id="Awake" onClick={AwakeHer}>Awake</button>
        <button id="Sleep" onClick={MakeHerSleep}>Sleep</button>
      </div>
    </>
  );
};

export default App;
