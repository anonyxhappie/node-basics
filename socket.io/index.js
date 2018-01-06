let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('New User Connected');
    socket.on('chat message', function(res){
        console.log('Message: ' + res.username + ': ' + res.msg);
    });

    socket.on('disconnect', function(){
        console.log('User Disconnected');
    });
});

http.listen(80, function(){
    console.log('listening on *:80');
});
