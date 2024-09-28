import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Camera = forwardRef(function Camera(
  { id, stream }: { id: string; stream?: MediaStream },
  ref: ForwardedRef<HTMLVideoElement | null>,
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [{ enabled }] = stream?.getVideoTracks() ?? [{}];
  const showVideo = enabled !== false;

  const handleVideoLoad = () => setIsLoaded(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <>
      {showVideo && (
        <motion.video
          layout
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 0,
          }}
          exit={{ opacity: 0, scale: 0 }}
          className={cn(
            "camera-video",
            "aspect-video max-h-80 w-full bg-black md:aspect-square",
          )}
          ref={ref ? ref : videoRef}
          autoPlay
          muted
          data-video-id={id}
          onLoadedData={handleVideoLoad}
        >
          Znacznik video nie jest wspierany przez przeglądarkę.
        </motion.video>
      )}
    </>
  );
});

export default Camera;
