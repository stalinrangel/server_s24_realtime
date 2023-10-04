let app = require('express')();
//let server = require('http')/*.createServer(app)*/;
//let io = require('socket.io')(server);
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');

const options = {
  key: fs.readFileSync('/etc/pki/tls/private/private.key'),
  cert: fs.readFileSync('/etc/pki/tls/certs/certificate.crt')
};
const server = https.createServer(options);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

io.on('connection', (socket) => {

  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.username, event: 'left'});
  });

  socket.on('set-name', (name) => {
    console.log(name)
    socket.join(name);
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined'});
  });

  socket.on('send-message', (message) => {
    console.log(message)
    io.emit(message.id, {msg: message.text, user: socket.username, createdAt: new Date()});
  });
});

var port = process.env.PORT || 3001;

server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});