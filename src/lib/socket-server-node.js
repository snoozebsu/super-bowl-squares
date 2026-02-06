let io = null;

function setSocketServer(server) {
  io = server;
}

function getSocketServer() {
  return io;
}

module.exports = { setSocketServer, getSocketServer };
