// electron/main.js - Wrapper Electron para SmartBusinessHome
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

let mainWindow;
const isDev = !app.isPackaged;

// Iniciar servidor Express dentro de Electron
let server;
function startServer() {
  const expressApp = require('../src/main/app');
  const port = process.env.PORT || 3000;
  server = expressApp.listen(port, () => console.log(`[Electron] Server en http://localhost:${port}`));
  return port;
}

function createWindow() {
  const port = startServer();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, '../assets/images/icons/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    title: 'SmartBusinessHome v2.0'
  });
  mainWindow.loadURL(`http://localhost:${port}`);
  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (server) try{ server.close(); }catch(e){}
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
