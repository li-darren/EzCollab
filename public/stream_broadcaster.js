const peerConnections = {};

const displayMediaOptions = {
    audio: false,
    video: {
        cursor: "always",
    }
}

const configuration = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};


// this is called from stream button to initiate
async function start_streaming() {
  try {
      console.log("Starting Stream!");
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      stream_window.srcObject = stream;
      socket.emit('Broadcasting');

  } catch (err) {
      console.error(err);
  }
}

socket.on('Watcher_Request', async ({socket_from_id}) => { 

  const peerConnection = new RTCPeerConnection (configuration);
  peerConnections[socket_from_id] = peerConnection;

  let stream = stream_window.srcObject;

  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
  console.log("Added all the tracks!");


  peerConnection.onicecandidate = (event) => {
    if (event.candidate){ //non null candidate
      console.log("Found Ice Candidate as Broadcaster", event);
      socket.emit('RTC_Connection_Candidate_to_Watcher', {socket_to_id: socket_from_id, candidate: event.candidate});
    }
  };

  // peerConnection.ontrack = (event) => {
  //   console.log("on track");
  //   // don't set srcObject again if it is already set.
  //   if (stream_window.srcObject){
  //     return;
  //   }else{
  //     stream_window.srcObject = event.streams[0];
  //   }
  // };

  await peerConnection.setLocalDescription(await peerConnection.createOffer());
  socket.emit('RTC_Connection_Offer', {socket_to_id: socket_from_id, desc: peerConnection.localDescription});

});

socket.on('RTC_Connection_Answer', async ({socket_from_id, desc}) => {
    try {

        console.log("Received Answer!");
        await peerConnections[socket_from_id].setRemoteDescription(desc);

      } catch (err) {
        console.error(err);
      }
});

socket.on('RTC_Connection_Candidate_to_Broadcaster', async (socket_from_id, candidate) => {

  try{
    if (candidate){
      console.log("Adding Candidate as Broadcaster!", candidate);
      await peerConnections[socket_from_id].addIceCandidate(candidate);
    }
    else{
      console.log("Null Candidate");
    }
  }
  catch(err){
    console.log(err);
  }
});


function take_screenshot(){ //to do

}

