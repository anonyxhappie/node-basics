let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('Connection Established');
    socket.on('chat', function(res){
        console.log(res.username + ': ' + res.msg);
    });

    socket.on('disconnect', function(){
        console.log('Disconnected');
    });
});

http.listen(80, function(){
    console.log('listening on *:80');
});
