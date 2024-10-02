import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TPeer } from "@/app/page.types";

const Camera = forwardRef(function Camera(
  {
    peer,
    stream,
    onClick,
    className,
    animate = true,
  }: {
    peer?: TPeer;
    stream?: MediaStream;
    animate?: boolean;
    className?: string;
    onClick?: () => void;
  },
  ref: ForwardedRef<HTMLVideoElement | null>,
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { isCameraEnabled } = peer ?? {};

  const handleVideoLoad = () => setIsLoaded(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, ref]);

  return (
    <>
      {isCameraEnabled && (
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
