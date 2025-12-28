const { app, BrowserWindow, screen } = require("electron");

app.disableHardwareAcceleration();

let win;

function createWindow() {
  const { width: screenW, height: screenH } =
    screen.getPrimaryDisplay().workAreaSize;

  const winW = 420;  
  const winH = 520;  

  win = new BrowserWindow({
    width: winW,
    height: winH,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    resizable: false,
  });
  const x = 0;
  const y = screenH - winH;

  win.setPosition(x, y);

  win.loadURL("http://localhost:5173/");

}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
