import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeletePopUpProps } from "@/interfaces/interfaces";

export default function DeletePopUp({
  open,
  onCancel,
  onConfirm,
  message = "Tem certeza que deseja remover este item da tabela?",
}: DeletePopUpProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent
        className="
          max-w-sm rounded-2xl p-6 space-y-4
          [&>button.absolute.right-4.top-4]:hidden
        "
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-700">{message}</p>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Não
          </Button>

          <Button variant="destructive" onClick={onConfirm}>
            Sim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}