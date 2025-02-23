import { motion } from "framer-motion";
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const Camera = forwardRef(function Camera(
  {
    className,
    isModalCamera,
    reducedMotion,
    stream,
    onClick,
  }: {
    className?: string;
    isModalCamera?: boolean;
    reducedMotion?: boolean;
    stream?: MediaStream;
    onClick?: () => void;
  },
  ref: ForwardedRef<HTMLVideoElement | null>,
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoad = () => setIsLoaded(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, ref]);

  return (
    <>
      <motion.video
        autoPlay
        layout
        muted
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded || reducedMotion ? 1 : 0,
        }}
        className={cn(
          "camera-video",
          "aspect-video max-h-80 w-full cursor-pointer rounded-md bg-black transition-opacity md:aspect-square",
          !isModalCamera &&
            "sm:w-[calc(50%-4px)] md:w-[calc((100%/3)-6px)] xl:w-[calc(25%-6px)]",
          // !hasFocus && "pointer-events-none !opacity-50",
          className,
        )}
        exit={{ opacity: 0, scale: reducedMotion ? 1 : 0 }}
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0 }}
        ref={ref ? ref : videoRef}
        onClick={onClick}
        onLoadedData={handleVideoLoad}
      >
        Znacznik video nie jest wspierany przez przeglądarkę.
      </motion.video>
    </>
  );
});

export default Camera;
