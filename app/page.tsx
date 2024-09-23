"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { v4 as uuidv4 } from "uuid";
import Camera from "@/components/ui/camera";
import Peer, { MediaConnection } from "peerjs";
import { TPeerMessages } from "./page.types";

export default function Home() {
  const [myPeer, setMyPeer] = useState<Peer>();
  const [myPeerId] = useState(() => uuidv4());
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStreams, setRemoteStreams] = useState<
    { stream: MediaStream; peerId: string }[]
  >([]);
  const remoteVideosRefs = useRef<(HTMLVideoElement | null)[]>([]);

  //
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const getCamera = async () => {
    let stream = createMediaStreamFake();

    try {
      stream = await window.navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch (err) {
      console.log("Cannot access the camera");
    } finally {
      setLocalStream(stream);
    }

    return stream;
  };

  const createEmptyVideoTrack = () => {
    const canvas = document.createElement("canvas");
    const stream = canvas.captureStream();
    const [track] = stream.getVideoTracks();

    return Object.assign(track, { enabled: false });
  };

  const createMediaStreamFake = () => {
    return new MediaStream([createEmptyVideoTrack()]);
  };

  const onCallStream = ({
    remoteStream,
    otherPeer,
  }: {
    remoteStream: MediaStream;
    otherPeer: string;
  }) => {
    console.log("got stream: ", { remoteStream });
    console.log("setRemoteStreams");

    setRemoteStreams((prevState) => [
      ...prevState,
      { stream: remoteStream, peerId: otherPeer },
    ]);
  };

  const onPeers = async ({
    peer,
    peers,
    localStream,
  }: {
    peers: string[];
    peer: Peer;
    localStream: MediaStream;
  }) => {
    peers.forEach((otherPeer) => {
      if (otherPeer === myPeerId) return;

      try {
        console.log(`calling ${otherPeer}`);
        console.log("my stream: ", { localStream });
        console.log({ peer });

        const call = peer.call(otherPeer, localStream);

        console.log({ call });

        call.on("stream", (remoteStream) =>
          onCallStream({ remoteStream, otherPeer })
        );
      } catch (err) {
        console.error(err);
      }
    });
  };

  const onPeerMessage = ({
    message: { activePeers },
    peer,
    localStream,
  }: {
    message: TPeerMessages;
    peer: Peer;
    localStream: MediaStream;
  }) => {
    if (activePeers) onPeers({ peers: activePeers, peer, localStream });
  };

  const onPeerOpen = ({
    peer,
    localStream,
  }: {
    peer: Peer;
    localStream: MediaStream;
  }) => {
    peer.socket.on("message", (message) => {
      onPeerMessage({ message, peer, localStream });
    });
  };

  const onPeerCall = ({
    call,
    localStream,
  }: {
    call: MediaConnection;
    localStream: MediaStream;
  }) => {
    console.log("someone call me");
    console.log({ localStream });

    call.answer(localStream);
    call.on("stream", (remoteStream) =>
      onCallStream({ remoteStream, otherPeer: call.peer })
    );
  };

  const onPeerLeft = (peerId: string) => {
    const filteredRemoteStreams = remoteStreams.filter(
      ({ peerId: id }) => peerId !== id
    );

    setRemoteStreams(filteredRemoteStreams);
  };

  useEffect(() => {
    const init = async () => {
      const cameraStream = await getCamera();

      if (socket.connected) {
        onConnect();
      }

      const peer = new Peer(myPeerId, {
        host: "/",
        path: "/",
        port: 9000,
        secure: true,
      });

      setMyPeer(peer);

      peer.on("open", () => onPeerOpen({ peer, localStream: cameraStream }));
      peer.on("call", (call) =>
        onPeerCall({ call, localStream: cameraStream })
      );

      // document.addEventListener("visibilitychange", function () {
      //   console.log({ hidden: document.hidden });

      //   if (document.hidden) {
      //     socket.emit("track-ended", "Użytkownik zmienił zakładkę");
      //   } else {
      //     socket.emit("track-ended", "Użytkownik powrócił na zakładkę");
      //   }
      // });

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

      // const onPeerEntered = async (peerId: string) => {
      //   console.log(`peer ${peerId} entered`);

      //   let call = null;
      //   try {
      //     console.log(`calling ${peerId}`);

      //     call = peer?.call(
      //       peerId,
      //       await navigator.mediaDevices.getUserMedia({
      //         video: { facingMode: "environment" },
      //       })
      //     );
      //   } catch (err) {}

      //   call?.on("close", () => {
      //     console.log("call close");
      //     console.log({ call });
      //   });
      //   call?.on("willCloseOnRemote", () => {
      //     console.log("call willCloseOnRemote");
      //   });
      //   call?.on("iceStateChanged", () => {
      //     console.log("call iceStateChanged");
      //   });
      //   call?.on("error", () => {
      //     console.log("call error");
      //   });
      // };

      socket.on("peers", (peers) =>
        onPeers({ peers, peer, localStream: cameraStream })
      );
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
  console.log({ remoteStreams });

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <p className="font-bold">{myPeer?.id}</p>
      <Camera stream={localStream} />
      {remoteStreams.map(({ peerId, stream }, index) => {
        console.log({ stream });

        return (
          <video
            key={peerId}
            data-video-id={peerId}
            className="camera-video"
            muted
            autoPlay
            ref={(el) => {
              remoteVideosRefs.current[index] = el;
              if (el) el.srcObject = stream;
            }}
          />
        );
      })}
    </div>
  );
}
