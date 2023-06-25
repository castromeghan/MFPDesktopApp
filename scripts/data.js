const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('api', {
    sendimportdata: (args) => ipcRenderer.invoke('send_import_data', args)
});