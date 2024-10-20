import "dotenv/config";
import next from "next";
import fs from "node:fs";
import { createServer } from "node:https";
import path from "node:path";
import { PeerServer } from "peer";
import { Server } from "socket.io";
import { TPeer, TPeerId } from "./app/page.types";
import { getServerUrls } from "./server.methods";

const { NODE_ENV, HOST, PORT_PEER, PORT_SERVER } = process.env;
const dev = NODE_ENV !== "production";
const hostname = HOST ?? "0.0.0.0";
const serverPort = Number(PORT_SERVER) || 3000;
const peerPort = Number(PORT_PEER) || 9000;
const serverUrls = getServerUrls(serverPort);

const app = next({ dev, hostname, port: serverPort });
const handler = app.getRequestHandler();

let peers: TPeer[] = [];

app.prepare().then(() => {
  const keyPath = path.join(__dirname, "certificates", "localhost-key.pem");
  const certPath = path.join(__dirname, "certificates", "localhost.pem");

  const options = {
    key: fs.readFileSync(keyPath, "utf-8"),
    cert: fs.readFileSync(certPath, "utf-8"),
  };

  const httpsServer = createServer(options, handler);

  const io = new Server(httpsServer);

  io.on("connection", (socket) => {
    console.log("connected socket");

    socket.on(
      "camera-toggle",
      (
        { enabled, peerId }: { enabled: boolean; peerId: string },
        callback: (peers: TPeer[]) => void,
      ) => {
        const targetPeer = peers.find((peer) => peer.id === peerId);

        if (!targetPeer) return;
        if (targetPeer.isCameraEnabled === enabled) return callback?.(peers);

        targetPeer.isCameraEnabled = enabled;

        socket.broadcast.emit("active-peers", peers);
        callback?.(peers);
      },
    );
  });

  const peerServer = PeerServer({
    host: hostname,
    path: "/",
    port: peerPort,
    ssl: options,
    corsOptions: {
      origin: serverUrls,
      methods: ["GET", "POST"],
    },
  });

  httpsServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(serverPort, () => {
      const urls = HOST
        ? `https://${HOST}:${serverPort}`
        : serverUrls?.join("\n");
      console.log(`\x1b[35mReady on:\n${urls}\x1b[0m`);
    });

  peerServer.on("connection", (client) => {
    console.log("Peer connected:", client.getId());
    peers.push({ id: client.getId(), isCameraEnabled: false });
    io.emit("peer-entered", client.getId());
    io.emit("active-peers", peers);
    // client.send({ activePeers: peers });
  });

  peerServer.on("disconnect", (client) => {
    console.log("Peer disconnected:", client.getId());
    peers = peers.filter((peer) => peer.id != client.getId());
    io.emit("peer-left", client.getId());
    io.emit("active-peers", peers);
  });
});
