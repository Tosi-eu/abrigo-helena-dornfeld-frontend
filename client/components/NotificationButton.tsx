import { useNotifications } from "@/hooks/use-notification.hook";
import { motion } from "framer-motion";
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
    </motion.button>
  );
}
