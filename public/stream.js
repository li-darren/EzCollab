const displayMediaOptions = {
    audio: false,
    video: {
        cursor: "always",
    }
}
// const configuration = {iceServers: [{urls: 'stuns:stun.example.org'}]};
// const pc = new RTCPeerConnection(configuration);
const pc = new RTCPeerConnection();
// send any ice candidates to the other peer
pc.onicecandidate = ({candidate}) => {
  console.log("on ice candidate");
  socket.emit('RTC_Connection', {candidate})
};

// let the "negotiationneeded" event trigger offer generation
pc.onnegotiationneeded = async () => {
    try {
      console.log("negotation needed");
      await pc.setLocalDescription(await pc.createOffer());
      // send the offer to the other peer
      socket.emit('RTC_Connection', {desc: pc.localDescription});
    } catch (err) {
      console.error(err);
    }
};

// once remote track media arrives, show it in remote video element
pc.ontrack = (event) => {
    console.log("on track");
    // don't set srcObject again if it is already set.
    // if (remoteView.srcObject) return;
    // remoteView.srcObject = event.streams[0];

    if (stream_window.srcObject) return;
    stream_window.srcObject = event.streams[0];
  };
  
// this is called from stream button to initiate
async function start_streaming() {
try {
    console.log("Starting Stream!");
    // get local stream, show it in self-view and add it to be sent
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    stream.getTracks().forEach((track) =>
        pc.addTrack(track, stream));
    stream_window.srcObject = stream;
} catch (err) {
    console.error(err);
}
}

socket.on('RTC_Connection', async ({desc, candidate}) => {
    try {
        console.log("RTC_Connection!");
        if (desc) {
          console.log("Desc!");
          // if we get an offer, we need to reply with an answer
          if (desc.type === 'offer') {
            console.log("Offer!");
            await pc.setRemoteDescription(desc);
            const stream = await navigator.mediaDevices.getUserMedia(displayMediaOptions);
            stream.getTracks().forEach((track) =>
              pc.addTrack(track, stream));
            await pc.setLocalDescription(await pc.createAnswer());
            socket.emit('RTC_Connection', {desc: pc.localDescription});
          } else if (desc.type === 'answer') {
            console.log("Answer!");
            await pc.setRemoteDescription(desc);
          } else {
            console.log('Unsupported SDP type.');
          }
        } else if (candidate) {
          console.log("Candidate!");
          await pc.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error(err);
      }
});


function take_screenshot(){ //to do

}

