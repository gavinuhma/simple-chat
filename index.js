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

  // Return messages sorted by score desending
  // and only return the last NUMBER_MESSAGES_TO_SHOW messages
  var NUMBER_MESSAGES_TO_SHOW = 100;
  client.zrevrangebyscore(
    'history',
    '+inf', 0, 'WITHSCORES',
    'LIMIT', 0, NUMBER_MESSAGES_TO_SHOW,
  function(err, results) {
    if (err) throw err;

    var messages = [];
    // Loop, increasing i by two each time, up to the number of results
    for (var i = 0; i < results.length; i = i+2) {
      // Only append the message if it exists
      if (results[i+1]) {
        messages.push({
          timestamp: results[i+1],
          text: results[i]
        });
      }
    }

    socket.emit('history', messages);
  });

  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('talk', function(msg){
    console.log('talk: ' + msg);
    client.zadd('history', Date.now(), msg, function(err) {
      socket.broadcast.emit('talk', msg);
    });
  });
  socket.on('yell', function(msg){
    console.log('yell!!!: ' + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

