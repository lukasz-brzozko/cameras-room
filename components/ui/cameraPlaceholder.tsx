import { motion } from "framer-motion";
import { Video } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

function CameraPlaceholder({
  isCameraLoading,
  handleToggleCameraButtonClick,
}: {
  isCameraLoading: boolean;
  handleToggleCameraButtonClick: () => void;
}) {
  return (
    <motion.div
      layout
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className={cn(
        "flex aspect-video max-h-80 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-[3px] border-dashed border-primary p-5 text-primary transition-opacity sm:w-[calc(50%-4px)] md:aspect-square md:w-[calc((100%/3)-6px)] xl:w-[calc(25%-6px)] dark:border-secondary dark:text-secondary",
        isCameraLoading && "pointer-events-none !opacity-50",
      )}
      exit={{ opacity: 0, scale: 0 }}
      initial={{ opacity: 0, scale: 0 }}
      role="button"
      onClick={handleToggleCameraButtonClick}
    >
      <span className="text-center text-xl font-medium lg:text-2xl">
        No video is currently shared.
        <br />
        Start streaming.
      </span>
      <Video
        className="h-8 w-8 text-primary lg:h-10 lg:w-10 dark:text-secondary"
        color="currentColor"
      />
    </motion.div>
  );
}

export default CameraPlaceholder;
