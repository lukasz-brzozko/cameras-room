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
  {
    id,
    stream,
    onClick,
    className,
    animate = true,
  }: {
    id: string;
    stream?: MediaStream;
    animate?: boolean;
    className?: string;
    onClick?: () => void;
  },
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
          initial={{ opacity: animate ? 0 : 1, scale: animate ? 0 : 1 }}
          animate={{
            opacity: isLoaded || !animate ? 1 : 0,
            scale: isLoaded || !animate ? 1 : 0,
          }}
          exit={animate ? { opacity: 0, scale: 0 } : {}}
          className={cn(
            "camera-video",
            "aspect-video max-h-80 w-full cursor-pointer rounded-md bg-black md:aspect-square",
            className,
          )}
          ref={ref ? ref : videoRef}
          autoPlay
          muted
          data-video-id={id}
          onLoadedData={handleVideoLoad}
          onClick={onClick}
        >
          Znacznik video nie jest wspierany przez przeglądarkę.
        </motion.video>
      )}
    </>
  );
});

export default Camera;
