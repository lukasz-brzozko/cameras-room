import "dotenv/config";
import next from "next";
import fs from "node:fs";
import { createServer } from "node:https";
import path from "node:path";
import { PeerServer } from "peer";
import { Server } from "socket.io";

const { NODE_ENV, HOST: hostname, PORT_PEER, PORT_SERVER } = process.env;
const dev = NODE_ENV !== "production";
const serverPort = Number(PORT_SERVER) || 3000;
const peerPort = Number(PORT_PEER) || 9000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port: serverPort });
const handler = app.getRequestHandler();

let peers: string[] = [];

app.prepare().then(() => {
  const keyPath = path.join(__dirname, "certificates", "localhost-key.pem");
  const certPath = path.join(__dirname, "certificates", "localhost.pem");

  const options = {
    key: fs.readFileSync(keyPath, "utf-8"),
    cert: fs.readFileSync(certPath, "utf-8"),
  };

  const httpsServer = createServer(options, handler);

  const io = new Server(httpsServer);

  io.on("connection", () => {
    console.log("connected socket");
  });

  const peerServer = PeerServer({
    host: hostname,
    path: "/",
    port: peerPort,
    ssl: options,
    corsOptions: {
      origin: [`https://${hostname}:${serverPort}`],
      methods: ["GET", "POST"],
    },
  });

  httpsServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(serverPort, () => {
      console.log(`> Ready on https://${hostname}:${serverPort}`);
    });

  peerServer.on("connection", (client) => {
    console.log("Peer connected:", client.getId());
    peers.push(client.getId());
    io.emit("peers", peers);
  });

  peerServer.on("disconnect", (client) => {
    console.log("Peer disconnected:", client.getId());
    peers = peers.filter((peer) => peer != client.getId());
    io.emit("peers", peers);
  });
});
