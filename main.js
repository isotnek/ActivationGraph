const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const fs = require('fs');
const path = require('path');
const os = require('os');

app.disableHardwareAcceleration();

let win;
let editorWin;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.loadFile('index.html')
  //win.webContents.openDevTools();
}

function createEditorWindow () {
  // Check if editor window already exists
  if (editorWin) {
    editorWin.focus();
    return;
  }

  editorWin = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  editorWin.loadFile('editor.html')

  editorWin.on('closed', () => {
    editorWin = null;
  });
}

app.whenReady().then(() => {
    createWindow();
  
    const menu = Menu.buildFromTemplate([
      {
        label: 'Menu',
        submenu: [
          { label: 'Open Editor', click() { createEditorWindow(); } },
          { label: 'Quit', click() {app.quit(); } }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ]
      }
    ])
  
    Menu.setApplicationMenu(menu);
  })
  

app.on('window-all-closed', () => {
    app.quit(); // Change this line to quit the app on all platforms
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function fromDOT(dot) {
    const lines = dot.split('\n');
    const nodes = [];
    const links = [];
  
    lines.forEach(line => {
      line = line.trim();
  
      if (line.startsWith('digraph') || line.startsWith('}') || line === '') {
        return;
      }
  
      if (line.includes('->')) {
        const [source, target] = line.slice(0, -1).split(' -> ');
        links.push({ source, target });
      } else {
        const [id, attrs] = line.slice(0, -1).split(' ');
        const group = Number(attrs.match(/group=(\d+)/)[1]);
        nodes.push({ id, group });
      }
    });
  
    return { nodes, links };
  }
  

ipcMain.on('graphviz-code', (event, data) => {
    const { nodes, links } = fromDOT(data);
  
    const fileContent = `
  var nodes = ${JSON.stringify(nodes)};
  var links = ${JSON.stringify(links)};
  
  module.exports = { nodes, links };
  `;
  
    fs.writeFile('./data.js', fileContent, (err) => {
      if (err) throw err;
      
      // Refresh the main window to show the updated graph
      win.reload();
    });
});

ipcMain.on('save-svg', (event, svgContent) => {
    let filePath = path.join(os.homedir(), 'Downloads', 'graph.svg');
    fs.writeFile(filePath, svgContent, (err) => {
        if (err) {
            console.error('Error writing file', err);
        } else {
            console.log('File saved to', filePath);
        }
    });
});
