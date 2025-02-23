import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect } from "react";

import { usePrevious } from "@/lib/hooks/usePrevious";

function ViewsCounter({ count = 0 }: { count?: number }) {
  const prevCount = usePrevious(count) ?? 0;
  const prevValue = useMotionValue(prevCount);
  const rounded = useTransform(prevValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(prevValue, count, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [count, prevValue]);

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      className="absolute right-4 top-4 flex items-center justify-center rounded-sm bg-red-500 px-2 py-1 text-white lg:right-8 lg:px-3 lg:text-xl"
      initial={{ opacity: 0, y: "-100%" }}
    >
      <Eye />
      <motion.span
        animate={{ opacity: [1, 0.75, 1] }}
        className="ml-1 font-bold"
        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
      >
        {rounded}
      </motion.span>
    </motion.aside>
  );
}

export default ViewsCounter;
