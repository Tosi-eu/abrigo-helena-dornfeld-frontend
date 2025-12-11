import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";
import { formatDateToPtBr } from "@/helpers/dates.helper";

interface NotificationReminderModalProps {
  open: boolean;
  events: Array<{
    id: number;
    residente: { nome: string };
    medicamento: { nome: string };
    destino: string;
    data_prevista: string;
  }>;
  onClose: () => void;
}

const NotificationReminderModal: FC<NotificationReminderModalProps> = ({
  open,
  events,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BellRing className="w-5 h-5" style={{ color: "#0284c7" }} />
            Notificações pendentes para hoje
          </DialogTitle>
        </DialogHeader>

        <p className="text-slate-600 mt-1 mb-4">
          Existem receitas que precisam ser emitidas hoje:
        </p>

        <ScrollArea className="max-h-80 pr-2">
          <div className="space-y-3">
            {events.map((ev) => (
              <Card key={ev.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">

                    <span className="font-bold text-lg text-slate-900">
                      {ev.residente.nome}
                    </span>

                    <div className="text-sm text-slate-700">
                      <span className="font-semibold">Medicamento: </span>
                      <span>{ev.medicamento.nome}</span>
                    </div>

                    <div className="text-sm text-slate-700">
                      <span className="font-semibold">Destino: </span>
                      <span>{ev.destino}</span>
                    </div>

                    <div className="text-sm text-slate-700">
                      <span className="font-semibold">Data prevista: </span>
                      <span>{formatDateToPtBr(ev.data_prevista)}</span>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto"
            style={{
              backgroundColor: "#0284c7",
              color: "white",
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationReminderModal;