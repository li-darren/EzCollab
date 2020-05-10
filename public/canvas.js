var canvas = document.querySelector('#canvas_draw');
var canvas_img = document.querySelector('#canvas_img');
const stream_window = document.querySelector('#video');

var c = canvas.getContext('2d');


var coloursave = "black";
var colour = "black";
var linewidth = 7;
var eraserwidth = 7;
var brushwidth = 7;
var can_draw = true;
resize();

var pos = { x: 0, y: 0 };

document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);

canvas.addEventListener('mouseover', function(){
    can_draw = true;
});
canvas.addEventListener('mouseout', function(){
    can_draw = false;
});

document.addEventListener('mouseup', release_mouse);
document.addEventListener('mouseenter', setPosition);
document.addEventListener('touchstart', function(e){
    setPositionTablet(e);
    e.preventDefault();
}, false);

//[Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive. See <URL>
// canvas.js:24 [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive. See https://www.chromestatus.com/features/5093566007214080
// (anonymous) @ canvas.js:24


document.addEventListener('touchmove', draw_tablet, false);

socket.on('othersdrawing', drawOthers);

socket.on('clear', function(){
    c.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelector('#GlobalUndo').disabled = true; //socket will also disable undo button
});

socket.on('Disable_Undo_Button', function(){
    document.querySelector('#GlobalUndo').disabled = true;
    document.querySelector('#GlobalUndo').value = "Global Undo ".concat("(0)");
});

socket.on('Enable_Undo_Button', function(num_undos){
    document.querySelector('#GlobalUndo').disabled = false;
    document.querySelector('#GlobalUndo').value = "Global Undo ".concat("(", num_undos, ")");
});

function release_mouse(){
    socket.emit('Release_Mouse');
}

function request_global_undo(){
    socket.emit('Request_Global_Undo');
}

function drawOthers(data){

        var old_data = {
            linewidth: c.lineWidth,
            strokeStyle: c.strokeStyle,
            globalCompositeOperation: c.globalCompositeOperation,
        };

        //1080p ratio with chrome should be about 
        
        var canvas_ratio_1080p = {
            width: 1665.7777777777776,
            height: 937
        };


        console.log("Receiving others drawing!");
        c.beginPath();
    
        c.lineWidth = data.lineWidth;
        c.lineCap = "round";
        c.strokeStyle = data.colour;

        c.globalCompositeOperation = data.globalCompositeOperation;

        
        c.moveTo(data.old_pos.x * (canvas.width / canvas_ratio_1080p.width), data.old_pos.y * (canvas.height / canvas_ratio_1080p.height));
        c.lineTo(data.new_pos.x * (canvas.width / canvas_ratio_1080p.width), data.new_pos.y * (canvas.height / canvas_ratio_1080p.height));
    
        c.stroke();
        c.closePath();


        //restore info
        c.lineWidth = old_data.linewidth;
        c.strokeStyle = old_data.strokeStyle;
        c.globalCompositeOperation = old_data.globalCompositeOperation;



}

function erase() {
    var confirmation = confirm("Are you sure you want to clear");
    if (confirmation) {
        c.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear');
    }
}

function save() {
    var downloadLink = document.createElement('a');
    var result_canvas = document.createElement("CANVAS");
    result_canvas.width = 1920;
    result_canvas.height = 1080;
    var result_canvas_ctx = result_canvas.getContext("2d");

    function save_drawing_and_download(){
        result_canvas_ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, result_canvas.width, result_canvas.height);
        downloadLink.href = result_canvas.toDataURL("image/png", 1);
        downloadLink.download = 'EzCollabDrawing.png';
        result_canvas_ctx.clearRect(0, 0, result_canvas_ctx.width, result_canvas_ctx.height);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }


    var is_canvas_img_blank = isCanvasBlank(canvas_img);

    try{
        if (stream_window.srcObject && is_canvas_img_blank){ //this means streaming and there's no image
            console.log("Image Canvas is blank");
            const track = stream_window.srcObject.getVideoTracks()[0];
            imageCapture = new ImageCapture(track);
        
            imageCapture.grabFrame()
            .then(imageBitmap => {
                result_canvas_ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height, 0, 0, result_canvas.width, result_canvas.height);
                save_drawing_and_download();
            })
            .catch(error => console.log(error));
        }
        else if (stream_window.srcObject && !is_canvas_img_blank){//this means that screen is frozen right now...
            console.log("Image Canvas is already Filled");
            var img = new Image;
            img.onload = function(){
                console.log('Drawing Image onto Result Canvas');
                result_canvas_ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, result_canvas.width, result_canvas.height);
                save_drawing_and_download();
            };
            img.src = local_frozen_img_url;            
        }
        else if (!stream_window.srcObject && is_canvas_img_blank){ //this means that there's no stream going on and no frozen image
            save_drawing_and_download();
        }
        else{
            console.err("There is a mismatch between freezing and stream that needs to be fixed.");
        }
    }
    catch(e){
        console.log("There is an error, mismatch with frozen screen and streaming", e);
    }
}

function isCanvasBlank(canvas) {
    return !canvas.getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height).data
      .some(channel => channel !== 0);
  }


function getColour(divElement){
    console.log("Changing color to: ".concat(divElement.id));
    switch(divElement.id){
        case "green":
            coloursave = "green";
            colour = "green";
            break;
        case "blue":
            coloursave = "blue";
            colour = "blue";
            break;
        case "red":
            coloursave = "red";
            colour = "red";
            break;
        case "yellow":
            coloursave = "yellow";
            colour = "yellow";
            break;
        case "orange":
            coloursave = "orange";
            colour = "orange";
            break;
        case "black":
            coloursave = "black";
            colour = "black";
            break;
        case "white7":
            colour = "white";
            eraserwidth = 7;
            break;
        case "white17":
            colour = "white";
            eraserwidth = 17;
            break;
        case "white27":
            colour = "white";
            eraserwidth = 27;
            break;
    }

    clearboxes();

    if (divElement.id == "white7" || divElement.id == "white17" || divElement.id == "white27"){
        document.getElementById(divElement.id).style.borderColor = "red";
        c.globalCompositeOperation = 'destination-out';
        linewidth = eraserwidth;
    }else{
        document.getElementById("width".concat(brushwidth)).style.borderColor = "red";
        c.globalCompositeOperation = 'source-over';
        linewidth = brushwidth;
    }

    document.getElementById("CurrentColour").style.background = colour;
    

}

function clearboxes(){

    document.getElementById("white7").style.borderColor = "black";
    document.getElementById("white17").style.borderColor = "black";
    document.getElementById("white27").style.borderColor = "black";
    document.getElementById("width7").style.borderColor = "white";
    document.getElementById("width17").style.borderColor = "white";
    document.getElementById("width27").style.borderColor = "white";
}

function setBrushWidth(divElement){ //this is for any colour that is not white
    console.log("Setting Width to: ".concat(divElement.id));
    c.globalCompositeOperation = 'source-over';
    clearboxes();
    document.getElementById(divElement.id).style.borderColor = "red";

    switch(divElement.id){
        case "width7":
            brushwidth = 7;
            break;
        case "width17":
            brushwidth = 17;
            break;
        case "width27":
            brushwidth = 27;
            break;
    }

    linewidth = brushwidth;
    colour = coloursave;
    document.getElementById("CurrentColour").style.background = colour;
}


function setPosition(e) {
    if (can_draw){
        pos.x = e.clientX;
        pos.y = e.clientY;  
        // console.log("x", pos.x, "y", pos.y);
    }
}

function setPositionTablet(e) {
    pos.x = e.touches[0].clientX;
    pos.y = e.touches[0].clientY;
}

function resize(){

    console.log("Resizing...");
    
    width = window.innerWidth * 0.8675925925925926;
    height = window.innerHeight;

    //1080p ratio with chrome should be about 
    
    // var canvas_ratio_1080p = {
    //     width: 1665.7777777777776,
    //     height: 937
    // };

    if ((width / height) > (1920/1080)){//this means that the width ratio is larger than the height, aka widescreen
        //then keep height and readjust width
        width = height * (1920/1080);
    }
    else{
        height = width / (1920/1080);
    }

    // console.log('canvas width: ', width);
    // console.log('canvas height: ', height);

    canvas.width = width;
    canvas.height = height;
    
    canvas_img.width = width;
    canvas_img.height = height;

    var width_string = "".concat(width, "px");
    var height_string = "".concat(height, "px");


    stream_window.style.width = width_string;
    stream_window.style.height = height_string;


}

function draw(e){

    if (e.buttons != 1 || !can_draw){ //this means not left click or mouse not on canvas
        return;
    }

    c.beginPath();

    c.lineWidth = linewidth;
    c.lineCap = "round";
    c.strokeStyle = colour;

    var old_pos = { x: pos.x, y: pos.y };

    c.moveTo(pos.x, pos.y);
    setPosition(e);

    var new_pos = { x: pos.x, y: pos.y };
    c.lineTo(pos.x, pos.y);

    c.stroke();

    //1080p ratio with chrome should be about 
    
    var canvas_ratio_1080p = {
        width: 1665.7777777777776,
        height: 937
    };

    var data = {
        old_pos: {
            x: old_pos.x * (canvas_ratio_1080p.width / canvas.width),
            y: old_pos.y * (canvas_ratio_1080p.height / canvas.height)
        },
        new_pos: {
            x: new_pos.x * (canvas_ratio_1080p.width / canvas.width),
            y: new_pos.y * (canvas_ratio_1080p.height / canvas.height)
        },

        lineWidth: linewidth,

        colour: colour,

        globalCompositeOperation: c.globalCompositeOperation,
    }

    socket.emit('othersdrawing', data);
    // console.log(data);
}

function draw_tablet(e){
    e.preventDefault();
    c.beginPath();

    c.lineWidth = linewidth;
    c.lineCap = "round";
    c.strokeStyle = colour;

    var old_pos = { x: pos.x, y: pos.y };

    c.moveTo(pos.x, pos.y);
    setPositionTablet(e);

    var new_pos = { x: pos.x, y: pos.y };
    c.lineTo(pos.x, pos.y);

    c.stroke();

    var data = {
        old_pos: {
            x: old_pos.x,
            y: old_pos.y
        },
        new_pos: {
            x: new_pos.x,
            y: new_pos.y
        },

        lineWidth: linewidth,

        colour: colour,

        globalCompositeOperation: c.globalCompositeOperation,
    }

    socket.emit('othersdrawing', data);
    // console.log(data);
}

window.onresize = function(){
    resize();
    socket.emit('Request_Current_Canvas');
    socket.emit('Check_If_Screen_Freeze');
};
