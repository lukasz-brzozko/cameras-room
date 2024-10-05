"use client";

import Camera from "@/components/ui/camera";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ToggleCameraButton from "@/components/ui/toggleCameraButton";
import ViewsCounter from "@/components/ui/viewsCounter";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash.debounce";
import Peer, { MediaConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { socket } from "../socket";
import { TPeer, TPeerId } from "./page.types";

export default function Home() {
  const [myPeer, setMyPeer] = useState<Peer>();
  const [myPeerId] = useState(() => uuidv4());
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isLocalCameraEnabled, setIsLocalCameraEnabled] = useState(false);
  const [activePeers, setActivePeers] = useState<
    { stream: MediaStream; peer: TPeer }[]
  >([]);
  const [calls, setCalls] = useState<MediaConnection[]>([]);
  const [activeStream, setActiveStream] = useState<{
    stream?: MediaStream;
    peer?: TPeer;
  } | null>(null);
  const remoteVideosRefs = useRef<{
    [peerId: string]: HTMLVideoElement | null;
  }>({});

  //
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  //

  const getInitStream = () => {
    const stream = createMediaStreamFake();
    setLocalStream(stream);

    return stream;
  };

  const setLocalCameraState = ({
    stream,
    isCameraEnabled,
  }: {
    stream: MediaStream;
    isCameraEnabled: boolean;
  }) => {
    setIsCameraLoading(false);
    setLocalStream(stream);
    setIsLocalCameraEnabled(isCameraEnabled);
  };

  const getCamera = async (useFakeStream: boolean | undefined) => {
    console.log("getCamera call");

    let stream = localStream ?? createMediaStreamFake();
    let isCameraEnabled = false;

    if (useFakeStream) {
      setLocalCameraState({ stream, isCameraEnabled });

      return { stream, isCameraEnabled };
    }

    try {
      stream = await window.navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 1024 },
          frameRate: { ideal: 15, max: 15 },
        },
      });
      isCameraEnabled = true;
    } catch (err) {
      console.warn(err);
      console.warn("Cannot access the camera");
    } finally {
      setLocalCameraState({ stream, isCameraEnabled });
    }

    return { stream, isCameraEnabled };
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
    otherPeerId,
  }: {
    remoteStream: MediaStream;
    otherPeerId: TPeerId;
  }) => {
    console.log("got stream: ", {
      otherPeerId,
      remoteStream: remoteStream.getVideoTracks()[0],
    });

    setActivePeers((prevState) => {
      const updatedPeers = [...prevState];
      const targetPeer = updatedPeers.find(
        ({ peer: { id } }) => otherPeerId === id,
      );

      if (!targetPeer) return prevState;

      targetPeer.stream = remoteStream;

      return updatedPeers;
    });
  };

  const onActivePeers = (peers: TPeer[]) => {
    setActivePeers((prevState) => {
      const prevPeers = [...prevState];
      const newPeers = peers.map((peer) => {
        const targetPrevPeer = prevPeers.find(
          (prevPeer) => prevPeer.peer.id === peer.id,
        );

        if (targetPrevPeer) {
          return {
            peer,
            stream: targetPrevPeer.stream,
          };
        }

        return {
          peer,
          stream: null as unknown as MediaStream,
        };
      });

      return newPeers;
    });
  };

  const addCall = (call: MediaConnection) => {
    setCalls((prevState) => [...prevState, call]);
  };

  const removeCall = (peerId: TPeerId) => {
    setCalls((prevState) => {
      const prevPeers = [...prevState];
      return prevPeers.filter(({ peer }) => peer !== peerId);
    });
  };

  const callToOtherPeers = async ({
    myPeer,
    peers,
    localStream,
  }: {
    myPeer: Peer;
    peers: TPeer[];
    localStream: MediaStream;
  }) => {
    const { id } = myPeer;

    peers.forEach((otherPeer) => {
      if (otherPeer.id === id) return;

      try {
        console.log(`calling ${otherPeer}`);
        console.log("my stream: ", { localStream });

        const call = myPeer.call(otherPeer.id, localStream);
        addCall(call);

        call.on("stream", (remoteStream) =>
          onCallStream({ remoteStream, otherPeerId: otherPeer.id }),
        );
      } catch (err) {
        console.error(err);
      }
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
    console.log({ localStream: localStream.getVideoTracks()[0] });

    call.answer(localStream);
    call.on("stream", (remoteStream) =>
      onCallStream({ remoteStream, otherPeerId: call.peer }),
    );
  };

  const onPeerLeft = (peerId: TPeerId) => {
    setActivePeers((prevState) =>
      prevState.filter(({ peer: { id } }) => peerId !== id),
    );
    removeCall(peerId);
  };

  const onPeerEntered = (peerId: TPeerId) => {
    // console.log("peer entered: ", { peerId });
  };

  const onInitCameraToggleFinish = (props: {
    myPeer: Peer;
    peers: TPeer[];
    localStream: MediaStream;
  }) => {
    callToOtherPeers(props);
  };

  const handleVideoClick = (
    peerStream: {
      peer?: TPeer;
      stream?: MediaStream;
    } | null,
  ) => setActiveStream(peerStream);

  const remotePeers = activePeers.filter(({ peer: { id } }) => id !== myPeerId);
  const localCameraPeer: TPeer = {
    id: myPeerId,
    isCameraEnabled: isLocalCameraEnabled,
  };

  const getCameraDebounced = useCallback(
    debounce((useFakeStream: boolean | undefined) => {
      getCamera(useFakeStream);
    }, 300),
    [localStream],
  );

  const toggleCamera = async (enable: boolean) => {
    console.log("click");

    await getCameraDebounced(!enable);
  };

  const handleToggleCameraButtonClick = () => {
    setIsCameraLoading(true);
    toggleCamera(!isLocalCameraEnabled);
  };

  useEffect(() => {
    socket.emit("camera-toggle", {
      enabled: isLocalCameraEnabled,
      peerId: myPeerId,
    });
  }, [isLocalCameraEnabled, myPeerId]);

  useEffect(() => {
    const init = async () => {
      // const { isCameraEnabled, stream: cameraStream } = await getCamera();
      const isCameraEnabled = false;
      const cameraStream = getInitStream();

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

      peer.on("open", () => {
        socket.emit(
          "camera-toggle",
          {
            enabled: isCameraEnabled,
            peerId: myPeerId,
          },
          (peers: TPeer[]) =>
            onInitCameraToggleFinish({
              peers,
              myPeer: peer,
              localStream: cameraStream,
            }),
        );
      });
      peer.on("call", (call) => {
        onPeerCall({ call, localStream: cameraStream });
        addCall(call);
      });

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

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("active-peers", onActivePeers);
      socket.on("peer-entered", onPeerEntered);
      socket.on("peer-left", onPeerLeft);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("active-peers", onActivePeers);
        socket.off("peer-entered", onPeerEntered);
        socket.off("peer-left", onPeerLeft);
      };
    };

    init();
  }, []);

  useEffect(() => {
    calls.forEach((call) => {
      const [sender] = call.peerConnection?.getSenders() ?? [];

      if (sender && localStream) {
        const [track] = localStream.getVideoTracks();
        sender.replaceTrack(track);
      }
    });
    console.log({ calls });
  }, [localStream, calls, myPeerId, isLocalCameraEnabled]);

  useEffect(() => {
    const peersId = Object.keys(remoteVideosRefs.current);

    peersId.forEach((id) => {
      const videoElement = remoteVideosRefs.current[id];
      if (!videoElement) return;

      const targetPeer = remotePeers.find(
        (remotePeer) => remotePeer.peer.id === id,
      );

      if (targetPeer && targetPeer.stream !== videoElement.srcObject) {
        videoElement.srcObject = targetPeer.stream;
      }
    });
  }, [remotePeers]);

  return (
    <>
      <div>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
        <p className="font-bold">{myPeer?.id}</p>
        <motion.div className="grid items-center gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {isLocalCameraEnabled && (
              <Camera
                peer={localCameraPeer}
                stream={localStream}
                onClick={() =>
                  handleVideoClick({
                    peer: localCameraPeer,
                    stream: localStream,
                  })
                }
              />
            )}
            {remotePeers.map(({ peer, stream }) => {
              return (
                <Camera
                  key={peer.id}
                  peer={peer}
                  onClick={() => handleVideoClick({ peer, stream })}
                  ref={(el) => {
                    if (el) {
                      remoteVideosRefs.current[peer.id] = el;
                      if (stream) el.srcObject = stream;
                    } else {
                      delete remoteVideosRefs.current[peer.id];
                    }
                  }}
                />
              );
            })}
            <motion.p layout key="p">
              test
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="fixed bottom-4 right-4 lg:right-8"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ToggleCameraButton
            isLocalCameraEnabled={isLocalCameraEnabled}
            isCameraLoading={isCameraLoading}
            onClick={handleToggleCameraButtonClick}
          />
        </motion.div>
      </div>

      <Dialog
        open={!!activeStream}
        onOpenChange={() => setActiveStream(null)}
        modal
      >
        <DialogContent>
          <DialogHeader className="hidden">
            <DialogTitle>Kamera</DialogTitle>
            <DialogDescription>
              Obraz aktualnie wybranej kamery
            </DialogDescription>
          </DialogHeader>
          <Camera
            className={
              "aspect-auto h-auto cursor-default max-md:max-h-[80vh] max-md:w-full md:aspect-auto md:max-h-[80vmin] md:min-w-[750px] md:max-w-[80vmin]"
            }
            peer={activeStream?.peer}
            key={activeStream?.peer?.id}
            stream={activeStream?.stream}
            onClick={() => handleVideoClick(null)}
            animate={false}
          />
        </DialogContent>
      </Dialog>
      <ViewsCounter count={activePeers.length} />
    </>
  );
}
