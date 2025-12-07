import { createContext, useState, ReactNode } from "react";

interface NotificationContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  count: number;
  setCount: (n: number) => void;
  reload: () => void;
  triggerReload: boolean;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [triggerReload, setTriggerReload] = useState(false);

  const reload = () => setTriggerReload((r) => !r);

  return (
    <NotificationContext.Provider
      value={{ open, setOpen, count, setCount, reload, triggerReload }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
