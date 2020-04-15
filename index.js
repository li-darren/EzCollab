var express = require('express');
var app = express ();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


server.listen(5000, function (){
    console.log("Listening to requests on port 5000");
});

//Static Files
app.use(express.static('public'));

var line_history = [];

io.on('connection', function(socket){

    // console.log(socket);
    console.log("Connected Socket!", socket.id);

    for (var i in line_history){
        socket.emit('othersdrawing', line_history[i]);
    }

    socket.on('othersdrawing', function(data){
        line_history.push(data);
        socket.broadcast.emit('othersdrawing', data);
        console.log("Sending out message");
    })

    socket.on('clear', function(){
        socket.broadcast.emit('clear')
        line_history = [];
        console.log("Clearing Board!");
    })
    
    socket.on('disconnect', () => {
        socket.removeAllListeners();
     });


});