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
pc.onicecandidate = ({candidate}) => socket.emit({candidate});

// let the "negotiationneeded" event trigger offer generation
pc.onnegotiationneeded = async () => {
    try {
      await pc.setLocalDescription(await pc.createOffer());
      // send the offer to the other peer
      socket.emit({desc: pc.localDescription});
    } catch (err) {
      console.error(err);
    }
};

// once remote track media arrives, show it in remote video element
pc.ontrack = (event) => {
    // don't set srcObject again if it is already set.
    if (remoteView.srcObject) return;
    remoteView.srcObject = event.streams[0];
  };
  
// call start() to initiate
async function start_streaming() {
try {
    // get local stream, show it in self-view and add it to be sent
    const stream = await navigator.mediaDevices.getUserMedia(displayMediaOptions);
    stream.getTracks().forEach((track) =>
        pc.addTrack(track, stream));
    stream_window.srcObject = stream;
} catch (err) {
    console.error(err);
}
}

socket.on('RTC_Connection', async ({desc, candidate}) => {
    try {
        if (desc) {
          // if we get an offer, we need to reply with an answer
          if (desc.type === 'offer') {
            await pc.setRemoteDescription(desc);
            const stream =
              await navigator.mediaDevices.getUserMedia(displayMediaOptions);
            stream.getTracks().forEach((track) =>
              pc.addTrack(track, stream));
            await pc.setLocalDescription(await pc.createAnswer());
            signaling.send({desc: pc.localDescription});
          } else if (desc.type === 'answer') {
            await pc.setRemoteDescription(desc);
          } else {
            console.log('Unsupported SDP type.');
          }
        } else if (candidate) {
          await pc.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error(err);
      }
});


function take_screenshot(){ //to do

}

