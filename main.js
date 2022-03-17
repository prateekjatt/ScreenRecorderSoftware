const {app,BrowserWindow,desktopCapturer, ipcMain, Menu,dialog} = require('electron')
const path = require('path')


app.on('ready',()=>{
    createWin()
    ipcMain.on('getSrc',getSrc)
    ipcMain.on('dialog',openDialog)
    ipcMain.on('minimize',(event)=>{BrowserWindow.fromWebContents(event.sender).minimize()})
})

async function createWin(){
    const win = new BrowserWindow({
        minWidth:700,
        minHeight:500,
        frame:false,
        webPreferences:{
            preload:path.join(__dirname,'preload.js'),
            nodeIntegration:true,
            contextIsolation:false,
        }
    })
    win.loadFile('index.html')
}

async function openDialog(event){
    dialog.showSaveDialog({
        defaultPath:`vid-${Date.now()}.webm`,
        buttonLabel:'Save Rec'
    }).then((filepath)=>{
        event.sender.send('filepath',filepath.filePath);
    })
}

async function getSrc(event){
    const src = await desktopCapturer.getSources({types:['window','screen']})
    const srcMenu = Menu.buildFromTemplate(src.map(
        source => {
            return {
                label:source.name,
                click: ()=>{
                    selectSource(source,event.sender)
                }
            }
        })
    )
    srcMenu.popup();
}

function selectSource(source,sender){
    sender.send('setsrc',source)
}



