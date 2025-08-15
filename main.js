const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,  // APP_CONFIG.WINDOW.WIDTH
        height: 900,  // APP_CONFIG.WINDOW.HEIGHT
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'src/js/preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

// == Open dialog box handling
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'] }
    ]
  });
  
  if (!result.canceled) {
    const filePath = result.filePaths[0];
    const imageData = fs.readFileSync(filePath);
    const base64 = `data:image/${path.extname(filePath).slice(1)};base64,${imageData.toString('base64')}`;
    return {
      path: filePath,
      data: base64
    };
  }
  return null;
});

// == Export image dialog box handling
ipcMain.handle('save-image', async (_, imageData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'PNG Images', extensions: ['png'] }
    ],
    defaultPath: 'processed_image.png'
  });
  
  if (!result.canceled) {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(result.filePath, base64Data, 'base64');
    return result.filePath;
  }
  return null;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});