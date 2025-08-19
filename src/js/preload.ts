const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD SCRIPT EXECUTED!');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => {
    // whitelist channels
    const validChannels = ['open-file-dialog', 'save-image'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});

// Also expose as a global variable for compatibility
console.log('electronAPI exposed:', typeof (window as any).electronAPI); 