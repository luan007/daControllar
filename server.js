var app = require('express')();
var serveStatic = require('serve-static');
var cors = require('cors');
var server = require('http').Server(app);
app.use(serveStatic("view"));

var io = require('socket.io')(server);
io.set('origins', '*:*');

var pingSock;
io.on('connection', function (socket) {
  socket.on('reqUpdate', function (data) {
    pingSock = socket;
    pingSock.emit("serverAlive");
    io.emit("update");
  });
  socket.on('command', function(data) {
    io.emit('command', data);
  });
  socket.on('packet', function(data) {
    if(pingSock) {
      pingSock.emit('collect', data);
    }
  });
});

server.listen(9999);