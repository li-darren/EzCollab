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
        console.log("Found Ice Candidate");
        socket.emit("RTC_Connection_Candidate_to_Broadcaster", {socket_id: socket_from_id, candidate: event.candidate});
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

  socket.emit('Watcher_Request');

});

socket.on('RTC_Connection_Candidate_to_Watcher', async (candidate) => {

  try{
    console.log("Adding Candidate as Watcher!");
    await peerConnection.addIceCandidate(candidate);
  }
  catch(err){
    console.log(err);
  }


});