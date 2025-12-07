import { useNotifications } from "@/hooks/use-notification.hook";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

export function NotificationButton() {
  const { count, setOpen } = useNotifications();

  return (
    <motion.button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 bg-sky-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-sky-700 transition-colors"
      animate={count > 0 ? { y: [-2, 2, -2] } : { y: 0 }}
      transition={{ repeat: count > 0 ? Infinity : 0, duration: 0.8 }}
    >
      <Bell className="w-6 h-6" />

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-2 py-0.5 shadow"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}