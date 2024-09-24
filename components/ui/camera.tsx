import React, { ForwardedRef, forwardRef, useEffect, useRef } from "react";

const Camera = forwardRef(function Camera(
  { id, stream }: { id: string; stream?: MediaStream },
  ref: ForwardedRef<HTMLVideoElement | null>
) {
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
        <video
          className="camera-video max-h-80 md:aspect-square w-full"
          ref={ref ? ref : videoRef}
          autoPlay
          muted
          data-video-id={id}
        >
          Znacznik video nie jest wspierany przez przeglądarkę.
        </video>
      )}
    </>
  );
});

export default Camera;
