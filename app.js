const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});


app.use(express.static(path.join(__dirname, 'public')));

let globalPoints = [];

io.on('connection', (socket) => {
  console.log('一位新用户已连接: ' + socket.id);


  socket.emit('initHistory', globalPoints);


  socket.on('addPoint', (pointData) => {
    globalPoints.push(pointData);
    
    io.emit('updateMap', pointData);
    
    
    if (globalPoints.length > 5000) globalPoints.shift();
  });

  socket.on('disconnect', () => {
    console.log('用户已断开连接');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});