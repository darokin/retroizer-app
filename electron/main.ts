import { app, BrowserWindow, dialog, ipcMain, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../js/preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    console.log("LOADING INDEX.HTML FILE ", path.join(__dirname, '../index.html'));
    console.log("PRELOAD SCRIPT PATH ", path.join(__dirname, '../js/preload.js'));

    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

// Configuration du protocole pour servir les fichiers .ts avec le bon MIME type
function setupProtocol(): void {
    protocol.interceptFileProtocol('file', (request, callback) => {
        const pathname = new URL(request.url).pathname;
        let filePath = path.normalize(decodeURI(pathname));
        
        // Sur Windows, enlever le slash initial
        if (process.platform === 'win32' && filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }
        
        // Si c'est un fichier .ts, on le sert avec le MIME type JavaScript
        if (filePath.endsWith('.ts')) {
            try {
                const data = fs.readFileSync(filePath);
                callback({
                    data: data,
                    mimeType: 'text/javascript'
                });
            } catch (error) {
                callback({ error: -2 }); // FILE_NOT_FOUND
            }
        } else {
            // Pour tous les autres fichiers, comportement normal
            callback({ path: filePath });
        }
    });
}

// Gestion des dialogues de fichiers
ipcMain.handle('open-file-dialog', async () => {
    if (!mainWindow) return null;
    
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

// Gestion de l'export d'images
ipcMain.handle('save-image', async (_, imageData: string) => {
    if (!mainWindow) return null;
    
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

app.whenReady().then(() => {
    setupProtocol();
    createWindow();
});

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
