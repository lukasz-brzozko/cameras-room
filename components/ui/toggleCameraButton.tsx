import { AnimatePresence, motion } from "framer-motion";
import { Video, VideoOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./button";
import { LoadingSpinner } from "./loadingSpinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "@/lib/utils";

function ToggleCameraButton({
  error,
  isCameraLoading,
  isLocalCameraEnabled,
  onClick,
}: {
  error: Error | null;
  isCameraLoading: boolean;
  isLocalCameraEnabled: boolean;
  onClick?: () => void;
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const renderIcon = (isLocalCameraEnabled: boolean) => {
    const icon = isLocalCameraEnabled ? <Video /> : <VideoOff />;

    return (
      <motion.div animate={{ scale: 1 }} initial={{ scale: 0 }}>
        {icon}
      </motion.div>
    );
  };

  useEffect(() => {
    const isOpen = !!error && !isCameraLoading;
    setIsTooltipOpen(isOpen);
  }, [error, isCameraLoading]);

  useEffect(() => {
    if (!isTooltipOpen) return;

    const timeout = setTimeout(() => setIsTooltipOpen(false), 2000);

    return () => clearTimeout(timeout);
  }, [isTooltipOpen]);

  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "size-14 transition lg:size-16 lg:hover:bg-primary/80",
              isLocalCameraEnabled &&
                "bg-red-500 text-primary-foreground lg:hover:bg-red-500/80 dark:bg-red-500 dark:text-primary-foreground dark:lg:hover:bg-red-500/80",
              isCameraLoading && "pointer-events-none",
            )}
            onClick={onClick}
          >
            {isCameraLoading ? (
              <LoadingSpinner />
            ) : (
              renderIcon(isLocalCameraEnabled)
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <AnimatePresence>{error && <p>{error.message}</p>}</AnimatePresence>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ToggleCameraButton;
