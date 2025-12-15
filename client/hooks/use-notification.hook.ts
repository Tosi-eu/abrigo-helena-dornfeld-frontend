import { NotificationContext } from "@/context/notification.context";
import { useContext } from "react";

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications precisa do NotificationProvider");
  return ctx;
};
