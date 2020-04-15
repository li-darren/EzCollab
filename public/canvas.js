var canvas = document.querySelector('canvas');

console.log("Attempting to Connect");
// var socket = io.connect("http://localhost:5000");
var socket = io.connect("http://ec2-3-92-177-98.compute-1.amazonaws.com:5000/");
console.log("Connected Socket from Client Side!");

var c = canvas.getContext('2d');

var coloursave = "black";
var colour = "black";
var linewidth = 7;
var eraserwidth = 7;
var brushwidth = 7;

resize();


var pos = { x: 0, y: 0 };

// window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

document.addEventListener('touchstart', sketchpad_touchStart, false);
document.addEventListener('touchmove', draw, false);

socket.on('othersdrawing', drawOthers);

socket.on('clear', function(){
    c.clearRect(0, 0, canvas.width, canvas.height);
});


function drawOthers(data){

        var old_data = {
            linewidth: c.lineWidth,
            strokeStyle: c.strokeStyle,
            globalCompositeOperation: c.globalCompositeOperation,
        };



        console.log("Receiving others drawing!");
        c.beginPath();
    
        c.lineWidth = data.lineWidth;
        c.lineCap = "round";
        c.strokeStyle = data.colour;

        c.globalCompositeOperation = data.globalCompositeOperation;

    
        c.moveTo(data.old_pos.x, data.old_pos.y);
        c.lineTo(data.new_pos.x, data.new_pos.y);
    
        c.stroke();



        //restore info
        c.lineWidth = old_data.linewidth;
        c.strokeStyle = old_data.strokeStyle;
        c.globalCompositeOperation = old_data.globalCompositeOperation;



}

function erase() {
    var message = confirm("Want to clear");
    if (message) {
        c.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear');
    }
}

function save() {
    var downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = 'MyCanvasImage.png';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
    pos.x = e.clientX;
    pos.y = e.clientY;
}

function resize(){
    canvas.width = window.innerWidth * .9;
    canvas.height = window.innerHeight * .9;
}

function draw(e){

    if (e.buttons != 1){ //this means not left click
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