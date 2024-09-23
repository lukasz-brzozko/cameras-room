import React, { useEffect, useRef } from "react";

function Camera({ stream }: { stream?: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [{ enabled }] = stream?.getVideoTracks() ?? [{}];
  const showVideo = enabled !== false;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <>
      {showVideo && (
        <video className="w-full md:w-1/2" ref={videoRef} autoPlay muted>
          Znacznik video nie jest wspierany przez przeglądarkę.
        </video>
      )}
    </>
  );
}

export default Camera;
