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

io.on('connection', function(socket){

    // console.log(socket);
    console.log("Connected Socket!", socket.id);

    socket.on('othersdrawing', function(data){
        socket.broadcast.emit('othersdrawing', data)
        console.log("Sending out message");
    })

    socket.on('clear', function(){
        socket.broadcast.emit('clear')
        console.log("Clearing Board!");
    })
    
    socket.on('disconnect', () => {
        socket.removeAllListeners();
     });


});