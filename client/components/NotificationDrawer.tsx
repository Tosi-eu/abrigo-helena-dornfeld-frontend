import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { toast } from "@/hooks/use-toast.hook";
import { NotificationCard } from "./NotiifcationCard";
import CreateNotificationForm from "./CreateNotificationEvent";
import { useNotifications } from "@/hooks/use-notification.hook";
import { getNotifications, updateNotification } from "@/api/requests";
import { EventStatus } from "@/utils/enums";
import { AnimatePresence, motion } from "framer-motion";

export function NotificationDrawer() {
  const { open, setOpen, triggerReload, setCount } = useNotifications();

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const [mode, setMode] = useState<"list" | "create">("list");
  const [editingNotification, setEditingNotification] = useState<any | null>(
    null,
  );

  const fetchNotifications = async (p = 1, append = false) => {
    try {
      const {
        items: data,
        total,
        hasNext,
      } = await getNotifications(p, 5, EventStatus.PENDENTE);

      console.log(hasNext);

      setItems((prev) => (append ? [...prev, ...data] : data));
      setCount(total);
      setHasNext(hasNext);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "error",
        duration: 3000,
      });

      if (!append) {
        setItems([]);
        setCount(0);
        setHasNext(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
      setMode("list");
      setPage(1);
      setEditingNotification(null);
      fetchNotifications(1);
    }
  }, [open, triggerReload]);

  const handleRemove = async (
    id: number,
    status: "sent" | "cancelled",
    message: string,
  ) => {
    try {
      await updateNotification(id, { status });
      toast({ title: message, variant: "success", duration: 3000 });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a notificação.",
        variant: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="p-6 w-[500px] ml-auto h-full border-l">
        <DrawerHeader>
          <DrawerTitle>
            {mode === "list"
              ? "Notificações Pendentes"
              : editingNotification
                ? "Editar Notificação"
                : "Criar Notificação"}
          </DrawerTitle>
        </DrawerHeader>

        {mode === "list" && (
          <>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center h-[70vh] text-slate-400 text-center"
                  >
                    Nenhuma notificação pendente.
                  </motion.div>
                ) : (
                  items.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                        y: -8,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      layout
                    >
                      <NotificationCard
                        residentName={n.residente_nome}
                        medicineName={n.medicamento_nome}
                        dateToGo={n.data_prevista}
                        destiny={n.destino}
                        createdBy={n.usuario?.login}
                        onComplete={() =>
                          handleRemove(n.id, "sent", "Notificação concluída")
                        }
                        onCancel={() =>
                          handleRemove(
                            n.id,
                            "cancelled",
                            "Notificação cancelada",
                          )
                        }
                        onEdit={() => {
                          setMode("create");
                          setEditingNotification({
                            medicamento_id: n.medicamento_id,
                            residente_id: n.residente_id,
                            destino: n.destino,
                            data_prevista: n.data_prevista,
                            criado_por: n.usuario?.id,
                            status: n.status,
                            id: n.id,
                          });
                        }}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              {items.length > 0 && hasNext && (
                <div className="text-center py-2">
                  <button
                    className="text-sky-600 hover:text-sky-700 font-medium"
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchNotifications(nextPage, true);
                    }}
                  >
                    Mostrar mais registros
                  </button>
                </div>
              )}
            </div>

            <DrawerFooter>
              <button
                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
                onClick={() => {
                  setMode("create");
                  setEditingNotification(null);
                }}
              >
                Criar Notificação
              </button>
            </DrawerFooter>
          </>
        )}

        {mode === "create" && (
          <>
            <div className="pt-2">
              <CreateNotificationForm
                editData={editingNotification}
                onCreated={() => {
                  setMode("list");
                  setEditingNotification(null);
                  setPage(1);
                  fetchNotifications(1);
                }}
              />
            </div>

            <DrawerFooter>
              <button
                form="create-notification-form"
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg w-full"
              >
                {editingNotification
                  ? "Salvar Alterações"
                  : "Criar Notificação"}
              </button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
