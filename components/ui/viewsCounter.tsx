import { usePrevious } from "@/lib/hooks/usePrevious";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect } from "react";

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
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute right-4 top-4 flex items-center justify-center rounded-sm bg-red-500 px-2 py-1 text-white lg:right-8 lg:px-3 lg:text-xl"
    >
      <Eye />
      <motion.span
        animate={{ opacity: [1, 0.75, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="ml-1 font-bold"
      >
        {rounded}
      </motion.span>
    </motion.aside>
  );
}

export default ViewsCounter;
