const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function getCourseStructure(dir) {
    const structure = [];
    const items = fs.readdirSync(dir).sort();

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            structure.push({
                name: item,
                type: 'directory',
                children: getCourseStructure(itemPath)
            });
        } else if (item.endsWith('.mp4')) {
            const subtitles = items
                .filter(subItem => subItem.startsWith(path.parse(item).name) && subItem.endsWith('.vtt'))
                .map(subtitleFile => {
                    const lang = path.parse(subtitleFile).name.replace(path.parse(item).name, '').trim();
                    return {
                        src: path.join(dir, subtitleFile),
                        srclang: lang.toLowerCase().substring(0, 2),
                        label: lang
                    };
                });
            structure.push({
                name: item,
                type: 'file',
                path: itemPath,
                subtitles: subtitles
            });
        } else if (!item.endsWith('.vtt')) {
            structure.push({
                name: item,
                type: 'file',
                path: itemPath
            });
        }
    });

    return structure;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL(`file://${path.join(app.getAppPath(), 'client/build/index.html')}`);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('open-folder-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle('get-course-structure', (event, coursePath) => {
  if (!coursePath || !fs.existsSync(coursePath)) {
    return { error: 'Invalid course path' };
  }
  return getCourseStructure(coursePath);
});

ipcMain.handle('get-resource', (event, resourcePath) => {
  if (!resourcePath || !fs.existsSync(resourcePath)) {
    return { error: 'File not found' };
  }
  return fs.readFileSync(resourcePath);
});
