const {ipcRenderer,dialog} = require('electron')
const { writeFile } = require('fs')
const { receiveMessageOnPort } = require('worker_threads')
const startbtn = document.querySelector('.start')
const stopbtn = document.querySelector('.stop')
const selectbtn = document.querySelector('.select')
const vid = document.querySelector('video')
const closebtn = document.querySelector('.close')
const restorebtn = document.querySelector('.restore')
const minbtn = document.querySelector('.minimize')
var cur_id = 0
let rec = []
let mediaRecorder

selectbtn.addEventListener('click',getVideoSources)
closebtn.addEventListener('click',()=>{window.close()})
restorebtn.addEventListener('click',()=>{
    window.moveTo(0,0);
    if(window.outerHeight != screen.height && window.outerWidth != screen.width)
        window.resizeTo(screen.width,screen.height)
    else
        window.resizeTo(700,500)
     
})
minbtn.addEventListener('click',()=>{ipcRenderer.send('minimize')})

startbtn.addEventListener('click',()=>{
    mediaRecorder.start();
})
stopbtn.addEventListener('click',()=>{
    mediaRecorder.stop();
})


async function getVideoSources(){
    ipcRenderer.send('getSrc')
}

ipcRenderer.on('setsrc',async (event,src)=>{
    selectbtn.innerHTML = src.name
    cur_id = src.id
    setScreen()
})

async function setScreen(){
    const stream = await navigator.mediaDevices.getUserMedia({
        audio:false,
        video:{
            mandatory:{
                chromeMediaSource:'desktop',
                chromeMediaSourceId:cur_id,
                minWidth: screen.width,
                maxWidth: screen.width,
                minHeight: screen.height,
                maxHeight: screen.height,
            }
        }
    })
    
    vid.srcObject = stream;
    vid.play();

    const options = {minetype:'video/webm;codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream,options)

    mediaRecorder.ondataavailable = startRec;
    mediaRecorder.onstop = stopRec;
}

function startRec(e){
    rec.push(e.data)
}

async function stopRec(){
    const blob = new Blob(rec,{minetype:'video/webm;codecs=vp9'});
    const buffer = Buffer.from(await blob.arrayBuffer());

    ipcRenderer.send('dialog')
    ipcRenderer.on('filepath',(event,filepath)=>{
        writeFile(filepath,buffer,()=>{console.log("Video Saved.")});
    })

    rec=[];
}


window.addEventListener('resize',async(e)=>{
    setScreen();
})