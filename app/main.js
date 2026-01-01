const { app, BrowserWindow, screen } = require("electron");
const path = require("path");

app.disableHardwareAcceleration();

// MUST be before app ready
app.commandLine.appendSwitch("enable-speech-dispatcher");
app.commandLine.appendSwitch("enable-speech-synthesis");   

let win;

function createWindow() {
  const { width: screenW, height: screenH } =
    screen.getPrimaryDisplay().workAreaSize;

  const winW = 320;
  const winH = 420;

  win = new BrowserWindow({
    width: winW,
    height: winH,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // optional
    },
  });

  const x = 0;
  const y = screenH - winH;
  win.setPosition(x, y);

  win.loadURL("http://localhost:5173/");

  // 🔥 THIS is the correct line
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => app.quit());
