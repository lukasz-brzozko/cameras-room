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
    reducedMotion,
    isModalCamera,
  }: {
    peer?: TPeer;
    stream?: MediaStream;
    reducedMotion?: boolean;
    className?: string;
    isModalCamera?: boolean;
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
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded || reducedMotion ? 1 : 0,
          }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0 }}
          className={cn(
            "camera-video",
            "aspect-video max-h-80 w-full cursor-pointer rounded-md bg-black md:aspect-square",
            !isModalCamera &&
              "sm:w-[calc(50%-4px)] md:w-[calc((100%/3)-6px)] xl:w-[calc(25%-6px)]",
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
