var express = require('express');
var app = express ();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


// server.listen(80, function (){
//     console.log("Listening to requests on port 80");
// });

app.listen(5000, () => console.log('Server running on port 3000'));

app.get('/', (req,res) => {
    res.send('Test!');
});


//Static Files
app.use(express.static('public'));

var line_history = [];

io.on('connection', function(socket){

    console.log("Connected Socket!", socket.id);
    var total_users = io.engine.clientsCount;
    console.log("Connected. Active Users: ", total_users);
    io.emit('getCount', total_users);

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

    socket.on('RTC_Connection', ({desc, candidate}) => {
        socket.broadcast.emit({desc, candidate});
    });

    
    socket.on('disconnect', function(){
        socket.removeAllListeners();
        console.log("Disconnected. Active Users: ", io.engine.clientsCount);
        io.emit('getCount', io.engine.clientsCount);
     });


});