var express = require('express');

var socket = require('socket.io');
const server = require('http').Server(app);

//setup the app

var app = express ();

server.listen(5000, function (){
    console.log("Listening to requests on port 5000");
});

//Static Files
app.use(express.static('public'));

//Setup the socket
var io = socket(server);


io.on('connection', function(socket){
    console.log("Connected Socket!", socket.id);

    socket.on('othersdrawing', function(data){
        socket.broadcast.emit('othersdrawing', data)
        console.log("Sending out message");
    })

    socket.on('clear', function(){
        socket.broadcast.emit('clear')
        console.log("Clearing Board!");
    })


});