import { useNotifications } from "@/hooks/use-notification.hook";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

export function NotificationButton() {
  const { count, setOpen } = useNotifications();
  const hasNotifications = count > 0;

  return (
    <motion.button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 bg-sky-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-sky-700 transition-colors z-50"
      animate={
        hasNotifications
          ? {
              scale: [1, 1.03, 1],
            }
          : {}
      }
      transition={{
        repeat: hasNotifications ? Infinity : 0,
        duration: 2,
        ease: "easeInOut",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Bell className="w-6 h-6" />

      <AnimatePresence>
        {hasNotifications && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[22px] h-5 flex items-center justify-center text-xs font-bold px-1.5 shadow-lg border-2 border-white"
          >
            {count > 99 ? "99+" : count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
