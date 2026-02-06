const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  require("./src/lib/socket-server-node.js").setSocketServer(io);

  io.on("connection", (socket) => {
    socket.on("join-game", (gameCode) => {
      if (gameCode) {
        socket.join(gameCode);
      }
    });

    socket.on("disconnect", () => {});
  });

  const listenHost = process.env.NODE_ENV === "production" ? "0.0.0.0" : hostname;
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, listenHost, () => {
      console.log(`> Ready on http://${listenHost}:${port}`);
    });
});
