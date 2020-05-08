var express = require('express');
var app = express ();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


server.listen(5000, () => console.log('Server running on port 5000'));

//Static Files
app.use(express.static('public'));

var line_history = [];

var in_progress_drawings = {};

var broadcaster = "";
var frozen_screen_url = "";

io.on('connection', function(socket){

    first_connection();

    function first_connection (){
        console.log("Connected Socket!", socket.id);
        var total_users = io.engine.clientsCount;
        console.log("Connected. Active Users: ", total_users);
        io.emit('getCount', total_users);
        in_progress_drawings[socket.id] = [];
        send_current_canvas_local();
        set_undo_button_status();

        if (broadcaster){
            console.log(socket.id, ' is requesting to watch');
            io.to(broadcaster).emit('Watcher_Request', {socket_from_id: socket.id});
        }

        if (frozen_screen_url){
            socket.emit('Freeze_Screen_With_Img', frozen_screen_url);
        }
    }

    function send_current_canvas_local (){
        for (var i = 0; i < line_history.length; ++i){
            for (var j = 0; j < line_history[i].length; ++j){
                socket.emit('othersdrawing', line_history[i][j]);
            }
        }
    }

    function send_current_canvas_global (){
        for (var i = 0; i < line_history.length; ++i){
            for (var j = 0; j < line_history[i].length; ++j){
                io.emit('othersdrawing', line_history[i][j]);
            }
        }
    }

    function set_undo_button_status (){

        if (!line_history.length){
            io.emit('Disable_Undo_Button');
        }
        else{
            io.emit('Enable_Undo_Button', line_history.length);
        }

    }

    socket.on('othersdrawing', function(data){
        in_progress_drawings[socket.id].push(data);
        socket.broadcast.emit('othersdrawing', data);   
    });

    socket.on('Release_Mouse', function(){
        if (Array.isArray(in_progress_drawings[socket.id]) && in_progress_drawings[socket.id].length){
            line_history.push(in_progress_drawings[socket.id]);
            in_progress_drawings[socket.id] = [];
        }
        
        set_undo_button_status();

    });

    socket.on('Request_Global_Undo', function(){

        if (Array.isArray(line_history) && line_history.length){
            line_history.pop();
            io.emit('clear');
            send_current_canvas_global();
        }
        else{
            console.error("Line History is Corrupted or Zero");
        }

        set_undo_button_status();

    });

    socket.on('Freeze_Screen_With_Img', function(img_data_url){
        frozen_screen_url = img_data_url;
        socket.broadcast.emit('Freeze_Screen_With_Img', img_data_url);
    });

    socket.on('UnFreeze_Screen_Img', function(){
        frozen_screen_url = "";
        socket.broadcast.emit('UnFreeze_Screen_Img');
    });


    socket.on('clear', function(){
        socket.broadcast.emit('clear');
        io.emit('Disable_Undo_Button');
        line_history = [];
        console.log("Clearing Board!");
    });
   
    socket.on('disconnect', function(){
        socket.removeAllListeners();
        console.log("Disconnected. Active Users: ", io.engine.clientsCount - 1);
        io.emit('getCount', io.engine.clientsCount - 1);
        delete in_progress_drawings[socket.id];
        //specific watcher/broadcaster disconnected happened in seperate code

        if (socket.id == broadcaster){
            stop_broadcasting();
        }
        else{
            if (broadcaster){
                io.to(broadcaster).emit('Watcher_Disconnect', socket.id); //tell broadcaster which watcher disconnected to free resources
            }
        }

    });

    socket.on('Request_Current_Canvas', function(){
        send_current_canvas_local ();
    });

    function stop_broadcasting(){
        console.log('Stopping Broadcast');
        broadcaster = "";
        socket.broadcast.emit('Stop_Broadcasting');
    }

    socket.on('Stop_Broadcasting', function(){
        stop_broadcasting();
    });

    socket.on('Broadcasting', function(){
        console.log('Someone is broadcasting!');
        broadcaster = socket.id;
        socket.broadcast.emit('Broadcasting');
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
