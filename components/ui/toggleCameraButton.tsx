import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Video, VideoOff } from "lucide-react";
import { Button } from "./button";
import { LoadingSpinner } from "./loadingSpinner";

function ToggleCameraButton({
  isLocalCameraEnabled,
  isCameraLoading,
  onClick,
}: {
  isLocalCameraEnabled: boolean;
  isCameraLoading: boolean;
  onClick?: () => void;
}) {
  const renderIcon = (isLocalCameraEnabled: boolean) => {
    const icon = isLocalCameraEnabled ? <Video /> : <VideoOff />;

    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        {icon}
      </motion.div>
    );
  };

  return (
    <Button
      className={cn(
        "size-14 transition lg:size-16 lg:hover:bg-primary/80",
        isLocalCameraEnabled &&
          "bg-red-500 text-primary-foreground dark:bg-red-500 dark:text-primary-foreground lg:hover:bg-red-500/80 dark:lg:hover:bg-red-500/80",
        isCameraLoading && "pointer-events-none",
      )}
      onClick={onClick}
    >
      {isCameraLoading ? <LoadingSpinner /> : renderIcon(isLocalCameraEnabled)}
    </Button>
  );
}

export default ToggleCameraButton;
