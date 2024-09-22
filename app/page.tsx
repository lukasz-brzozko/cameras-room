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
    const init = async () => {
      const createMediaStreamFake = () => {
        return new MediaStream([
          createEmptyVideoTrack({ width: 640, height: 480 }),
        ]);
      };

      const createEmptyVideoTrack = ({ width, height }) => {
        const canvas = Object.assign(document.createElement("canvas"), {
          width,
          height,
        });
        canvas.getContext("2d").fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        const track = stream.getVideoTracks()[0];

        return Object.assign(track, { enabled: false });
      };

      let localStream = createMediaStreamFake();

      try {
        localStream = await window.navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch (err) {}

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
      peer.on("open", (id) => {
        peer.socket.on("message", ({ activePeers }) => {
          console.log({ activePeers });
          if (activePeers) onPeers(activePeers);
        });
      });
      peer.on("call", (call) => {
        console.log("someone call me");
        console.log({ localStream });

        call.answer(localStream);

        call.on("stream", (userVideoStream) => {
          console.log("got stream: ", { userVideoStream });
          const peerVideo = document.querySelector(
            `[data-video-id="${call.peer}"]`
          );
          let video = peerVideo as HTMLVideoElement;
          console.log({ peerVideo });

          if (!peerVideo) {
            const newVideo = document.createElement("video");
            newVideo.className = "camera-video";
            newVideo.dataset.videoId = call.peer;
            video = newVideo;
          }

          console.log({ userVideoStream });
          video.autoplay = true;
          video.muted = true;
          video.srcObject = userVideoStream;
          document.body.appendChild(video);
        });
      });

      document.addEventListener("visibilitychange", function () {
        console.log({ hidden: document.hidden });

        if (document.hidden) {
          socket.emit("track-ended", "Użytkownik zmienił zakładkę");
        } else {
          socket.emit("track-ended", "Użytkownik powrócił na zakładkę");
        }
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

      const onPeers = async (peers: string[]) => {
        console.log({ peers });
        let stream = createMediaStreamFake();
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
        } catch (err) {
          console.log({ err });
        }

        peers.forEach((otherPeer) => {
          if (otherPeer === userId) return;

          try {
            console.log(`calling ${otherPeer}`);
            console.log("my stream: ", { stream });
            console.log({ peer });

            const call = peer.call(otherPeer, stream);

            console.log({ call });

            call.on("stream", (userVideoStream) => {
              console.log("got stream: ", { userVideoStream });

              const peerVideo = document.querySelector(
                `[data-video-id="${otherPeer}"]`
              );
              let video = peerVideo as HTMLVideoElement;
              console.log({ peerVideo });

              if (!peerVideo) {
                const newVideo = document.createElement("video");
                newVideo.className = "camera-video";
                newVideo.dataset.videoId = otherPeer;
                video = newVideo;
              }

              console.log({ userVideoStream });
              video.autoplay = true;
              video.muted = true;
              video.srcObject = userVideoStream;
              document.body.appendChild(video);
            });
          } catch (err) {
            console.log({ err });
          }
        });
      };

      const onPeerEntered = async (peerId: string) => {
        console.log(`peer ${peerId} entered`);

        let call = null;
        try {
          console.log(`calling ${peerId}`);

          call = peer?.call(
            peerId,
            await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" },
            })
          );
        } catch (err) {}

        call?.on("close", () => {
          console.log("call close");
          console.log({ call });
        });
        call?.on("willCloseOnRemote", () => {
          console.log("call willCloseOnRemote");
        });
        call?.on("iceStateChanged", () => {
          console.log("call iceStateChanged");
        });
        call?.on("error", () => {
          console.log("call error");
        });
      };

      const onPeerLeft = (peerId: string) => {
        document.querySelector(`[data-video-id="${peerId}"]`)?.remove();
      };

      socket.on("peers", onPeers);
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      // socket.on("peer-entered", onPeerEntered);
      socket.on("peer-left", onPeerLeft);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    };
    init();
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
