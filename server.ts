import next from "next";
import fs from "node:fs";
import { createServer } from "node:https";
import path from "node:path";
import { PeerServer } from "peer";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const PORTS = {
  server: 3000,
  peer: 9000,
};
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port: PORTS.server });
const handler = app.getRequestHandler();

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
  console.log({ certPath, keyPath });

  const peerServer = PeerServer({
    port: PORTS.peer,
    host: hostname,
    ssl: options,
    path: "/",
  });

  httpsServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(PORTS.server, () => {
      console.log(`> Ready on https://${hostname}:${PORTS.server}`);
    });

  peerServer.on("connection", (client) => {
    console.log("Peer connected:", client.getId());
  });

  peerServer.on("disconnect", (client) => {
    console.log("Peer disconnected:", client.getId());
  });
});
