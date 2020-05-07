let peerConnection;

socket.on('RTC_Connection_Offer', async ({socket_from_id, desc}) => {
  try {

    peerConnection = new RTCPeerConnection(configuration);
    console.log("Offer!");

    await peerConnection.setRemoteDescription(desc);
    await peerConnection.setLocalDescription(await peerConnection.createAnswer());
    socket.emit('RTC_Connection_Answer', {socket_to_id: socket_from_id, desc: peerConnection.localDescription});
  
    peerConnection.ontrack = event => {
      console.log("on track");
      // don't set srcObject again if it is already set.
      if (stream_window.srcObject){
        return;
      }else{
        stream_window.srcObject = event.streams[0];
        // stream_window.play();
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate){
        console.log("Found Ice Candidate as Watcher", event);
        socket.emit('RTC_Connection_Candidate_to_Broadcaster', {socket_to_id: socket_from_id, candidate: event.candidate});
      }
    };

   
    if (!stream_window.srcObject){
      stream_window.srcObject = peerConnection.getRemoteStreams()[0];
    }
  

    // var receivers = peerConnection.getReceivers();
    // const media_stream = new MediaStream();
    // console.log(receivers);
    // media_stream.addTrack(receivers[0].track);
    // if (!stream_window.srcObject && receivers) {
    //     stream_window.srcObject = media_stream;
    // }else{
    //   console.log("Already stream playing or no one is streaming!");
    // }
  


    } catch (err) {
      console.error(err);
    }

});

socket.on('Broadcasting', async () => {
  document.querySelector('#Stream').disabled = true;
  document.querySelector('#StopStream').disabled = true;
  document.querySelector('#FreezeStream').disabled = false;
  document.querySelector('#UnFreeze').disabled = true;
  socket.emit('Watcher_Request');
});

socket.on('RTC_Connection_Candidate_to_Watcher', async (candidate) => {

  try{
    if (candidate){
      console.log("Adding Candidate as Watcher!", candidate);
      await peerConnection.addIceCandidate(candidate);
    }
    else{
      console.log("Null Candidate");
    }
  }
  catch(err){
    console.log(err);
  }


});

socket.on('Stop_Broadcasting', async () => {

  stream_window.srcObject = null;
  canvas_img.getContext("2d").clearRect(0, 0, canvas_img.width, canvas_img.height);
  document.querySelector('#Stream').disabled = false;
  document.querySelector('#StopStream').disabled = true;
  document.querySelector('#FreezeStream').disabled = true;
  document.querySelector('#UnFreeze').disabled = true;
  watcher_free_resources();

});


window.onbeforeunload = function (e){
  watcher_free_resources();
  socket.close();
};

function watcher_free_resources(){

  if(peerConnection){
    peerConnection.close();
    delete peerConnection;
  }
  
}

function freeze_stream(){

  console.log("Freezing Stream");

  try{
    document.querySelector('#FreezeStream').disabled = true;
    document.querySelector('#UnFreeze').disabled = false;
    const track = stream_window.srcObject.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);

    imageCapture.grabFrame()
    .then(imageBitmap => {
      canvas_img.getContext("2d").drawImage(imageBitmap, 0, 0, canvas_img.width, canvas_img.height);
    })
    .catch(error => console.log(error));

  }
  catch(e){
    console.log("Unable to freeze frame", e);
  }
}

function unfreeze_stream (){
  document.querySelector('#FreezeStream').disabled = false;
  document.querySelector('#UnFreeze').disabled = true;
  canvas_img.getContext("2d").clearRect(0, 0, canvas_img.width, canvas_img.height);
}