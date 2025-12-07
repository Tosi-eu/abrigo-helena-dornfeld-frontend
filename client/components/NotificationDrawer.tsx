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

export function NotificationDrawer() {
  const { open, setOpen, triggerReload, setCount } = useNotifications();

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"list" | "create">("list");
  const [editingNotification, setEditingNotification] = useState<any | null>(null);

  const fetchNotifications = async (p = 1, append = false) => {
    setLoading(true);
    try {
      const { items: data, total } = await getNotifications(p, 5, EventStatus.PENDENTE);
      setItems((prev) => (append ? [...prev, ...data] : data));
      setCount(total);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "error",
      });
      if (!append) {
        setItems([]);
        setCount(0);
      }
    } finally {
      setLoading(false);
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

  console.log(items)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="p-6 w-[500px] ml-auto h-full border-l">
        <DrawerHeader>
          <DrawerTitle>
            {mode === "list" ? "Notificações Pendentes" : editingNotification ? "Editar Notificação" : "Criar Notificação"}
          </DrawerTitle>
        </DrawerHeader>

        {mode === "list" && (
          <>
            {loading && items.length === 0 ? (
              <div className="text-center py-10 text-slate-500">Carregando...</div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    Nenhuma notificação pendente.
                  </div>
                ) : (
                  <>
                    {items.map((n) => (
                      <NotificationCard
                        key={n.id}
                        residentName={n.residente_nome}
                        medicineName={n.medicamento_nome}
                        dateToGo={n.data_prevista}
                        destiny={n.destino}
                        createdBy={n.usuario?.login}
                        onComplete={async () => {
                          await updateNotification(n.id, { status: "sent" });
                          toast({ title: "Notificação concluída", variant: "success" });
                          setItems((prev) => prev.filter((item) => item.id !== n.id));
                        }}
                        onCancel={async () => {
                          await updateNotification(n.id, { status: "cancelled" });
                          toast({ title: "Notificação cancelada", variant: "success" });
                          setItems((prev) => prev.filter((item) => item.id !== n.id));
                        }}
                        onRemove={() => setItems((prev) => prev.filter((item) => item.id !== n.id))}
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
                    ))}

                    {!loading && (
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
                  </>
                )}
              </div>
            )}

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
                {editingNotification ? "Salvar Alterações" : "Criar Notificação"}
              </button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}