var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
  console.log("Error " + err);
});

client.set("app name", "simple chat", redis.print);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  client.get('app name', function(err, reply) {
    console.log('app name is', reply);
  });
  client.hgetall('history', function(err, replies) {
    socket.emit('history', replies);
  });

  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('talk', function(msg){
    console.log('talk: ' + msg);
    socket.broadcast.emit('talk', msg);
    client.incr('msg_id', function(err, msg_id) {
      console.log('msg_id', msg_id);
      client.hset('history', msg_id, msg);
    });
  });
  socket.on('yell', function(msg){
    console.log('yell!!!: ' + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

