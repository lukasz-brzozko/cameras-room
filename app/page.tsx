"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import { v4 as uuidv4 } from "uuid";
import Camera from "@/components/ui/camera";
import Peer from "peerjs";

export default function Home() {
  const [myPeer, setMyPeer] = useState<Peer>();
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    let stream: MediaStream;

    window.navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((videoStream) => (stream = videoStream));

    const userId = uuidv4();

    if (socket.connected) {
      onConnect();
    }

    const peer = new Peer(userId, {
      host: "/",
      path: "/",
      port: 9000,
      secure: true,
    });

    setMyPeer(peer);

    peer.on("call", (call) => {
      console.log("someone call me");
      call.answer(stream);
      const video = document.createElement("video");
      video.className = "camera-video";
      call.on("stream", (userVideoStream) => {
        console.log({ userVideoStream });
        video.autoplay = true;
        video.muted = true;
        video.srcObject = userVideoStream;
        document.body.appendChild(video);
      });
    });

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    const onPeers = (peers: string[]) => {
      console.log({ peers });

      peers.forEach(async (otherPeer) => {
        if (otherPeer === userId) return;

        peer?.call(
          otherPeer,
          await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })
        );
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("peers", onPeers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <p className="font-bold">{myPeer?.id}</p>
      <Camera />
    </div>
  );
}
