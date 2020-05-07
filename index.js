var express = require('express');
var app = express ();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


server.listen(5000, () => console.log('Server running on port 5000'));

//Static Files
app.use(express.static('public'));

var line_history = [];

var broadcaster;
let broadcasting = false;

io.on('connection', function(socket){

    console.log("Connected Socket!", socket.id);
    var total_users = io.engine.clientsCount;
    console.log("Connected. Active Users: ", total_users);
    io.emit('getCount', total_users);

    if (broadcasting){
        console.log(socket.id, ' is requesting to watch');
        io.to(broadcaster).emit('Watcher_Request', {socket_from_id: socket.id});
    }

    for (var i in line_history){
        socket.emit('othersdrawing', line_history[i]);
    }

    socket.on('othersdrawing', function(data){
        line_history.push(data);
        socket.broadcast.emit('othersdrawing', data);   
    });

    socket.on('clear', function(){
        socket.broadcast.emit('clear')
        line_history = [];
        console.log("Clearing Board!");
    });
   
    socket.on('disconnect', function(){
        socket.removeAllListeners();
        console.log("Disconnected. Active Users: ", io.engine.clientsCount - 1);
        io.emit('getCount', io.engine.clientsCount - 1);
        //specific watcher/broadcaster disconnected happened in seperate code

        if (socket.id == broadcaster){
            stop_broadcasting();
        }
        else{
            io.to(broadcaster).emit('Watcher_Disconnect', socket.id); //tell broadcaster which watcher disconnected to free resources
        }

    });

    function stop_broadcasting(){
        broadcaster = null;
        broadcasting = false;
        socket.broadcast.emit('Stop_Broadcasting');
        console.log('Stopping Broadcast');
    }


    socket.on('Stop_Broadcasting', function(){
        stop_broadcasting();
    });

    socket.on('Broadcasting', function(){
        console.log('Someone is broadcasting!');
        broadcaster = socket.id;
        socket.broadcast.emit('Broadcasting');
        broadcasting = true;
    });

    socket.on('RTC_Connection_Offer', ({socket_to_id, desc}) => {
        console.log("Sending RTC Connection Offer");
        io.to(socket_to_id).emit('RTC_Connection_Offer', {socket_from_id: socket.id, desc});
    });

    socket.on('RTC_Connection_Answer', ({socket_to_id, desc}) => {
        console.log("Sending RTC Connection Answer");
        io.to(socket_to_id).emit('RTC_Connection_Answer', {socket_from_id: socket.id, desc});
    });

    socket.on('Watcher_Request', function(){
        console.log(socket.id, ' is requesting to watch');
        io.to(broadcaster).emit('Watcher_Request', {socket_from_id: socket.id});
    });

    socket.on('RTC_Connection_Candidate_to_Broadcaster', ({socket_to_id, candidate}) => {
        console.log("Found Ice Candidate to Broadcaster");
        io.to(socket_to_id).emit('RTC_Connection_Candidate_to_Broadcaster', socket.id, candidate);
    });

    socket.on('RTC_Connection_Candidate_to_Watcher', ({socket_to_id, candidate}) => {
        console.log("Found Ice Candidate to Watcher");
        io.to(socket_to_id).emit('RTC_Connection_Candidate_to_Watcher', candidate);
    });

});
