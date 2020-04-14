var canvas = document.querySelector('canvas');


var c = canvas.getContext('2d');

var colour = "black";
var linewidth = 3;
var eraserwidth = 3;
var brushwidth = 3;

resize();


var pos = { x: 0, y: 0 };

// window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

function erase() {
    var message = confirm("Want to clear");
    if (message) {
        c.clearRect(0, 0, canvas.width, canvas.height);
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
    globalCompositeOperation = 'source-over';
    switch(divElement.id){
        case "green":
            colour = "green";
            break;
        case "blue":
            colour = "blue";
            break;
        case "red":
            colour = "red";
            break;
        case "yellow":
            colour = "yellow";
            break;
        case "orange":
            colour = "orange";
            break;
        case "black":
            colour = "black";
            break;
        case "white1":
            colour = "white";
            eraserwidth = 7;
            break;
        case "white2":
            colour = "white";
            eraserwidth = 17;
            break;
        case "white3":
            colour = "white";
            eraserwidth = 27;
            break;
    }

    if (divElement.id == "white1" || divElement.id == "white2" || divElement.id == "white3"){
        linewidth = eraserwidth;
    }else{
        linewidth = brushwidth;
    }

    document.getElementById("CurrentColour").style.background = colour;

}

function setBrushWidth(divElement){
    console.log("Changing color to: ".concat(divElement.id));

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

    c.moveTo(pos.x, pos.y);
    setPosition(e);
    c.lineTo(pos.x, pos.y);

    c.stroke();


}