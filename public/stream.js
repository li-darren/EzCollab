ask_for_stream();

function ask_for_stream(){

    displayMediaOptions = {
        audio: true,
        video: {
            cursor: "always",
        }
    }

    stream = startCapture(displayMediaOptions);

    // stream = startCapture(displayMediaOptions);

    if (!stream){
        console.error("Could not start stream");
    }

    return stream;

}

function startCapture(displayMediaOptions) {   
    return navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
       .catch(err => { console.error("Error:" + err); return null; });
}