const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  getCourseStructure: (coursePath) => ipcRenderer.invoke('get-course-structure', coursePath),
  getResource: (resourcePath) => ipcRenderer.invoke('get-resource', resourcePath),
});
