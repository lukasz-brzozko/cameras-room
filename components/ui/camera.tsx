import React, { useEffect, useRef, useState } from "react";

function Camera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCamera = async () => {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "environment" },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(stream);
      } catch (err) {
        console.log({ err });
      }
    };

    getCamera();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video className="w-full md:w-1/2" ref={videoRef} autoPlay muted>
      Znacznik video nie jest wspierany przez przeglądarkę.
    </video>
  );
}

export default Camera;
