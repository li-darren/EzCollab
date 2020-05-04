let peerConnection;

// const configuration = {iceServers: [{urls: 'stuns:stun.example.org'}]};
// const pc = new RTCPeerConnection(configuration);
// send any ice candidates to the other peer


socket.on('RTC_Connection_Offer', async ({socket_from_id, desc}) => {
  try {

    peerConnection = new RTCPeerConnection();
    console.log("Offer!");

    await peerConnection.setRemoteDescription(desc);
    await peerConnection.setLocalDescription(await peerConnection.createAnswer());

    socket.emit('RTC_Connection_Answer', {socket_to_id: socket_from_id, desc: peerConnection.localDescription});

    peerConnection.onicecandidate = (event) => {
      if (event.candidate){
        console.log("Found Ice Candidate");
        socket.emit("RTC_Connection_Candidate_to_Broadcaster", {socket_id: socket_from_id, candidate: event.candidate});
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("on track");
      // don't set srcObject again if it is already set.
      if (stream_window.srcObject){
        return;
      }else{
        stream_window.srcObject = event.streams[0];
      }
    };
  
    // var receivers = peerConnection.getReceivers();
  
    // if (!stream_window.srcObject && receivers) {
    //   stream_window.srcObject = receivers[0].track;
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
    console.log("Adding Candidate as Watcher!", candidate);
    await peerConnection.addIceCandidate(candidate);
  }
  catch(err){
    console.log(err);
  }


});