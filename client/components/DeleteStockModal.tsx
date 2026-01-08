import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteStockModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
  loading?: boolean;
}

export default function DeleteStockModal({
  open,
  onCancel,
  onConfirm,
  itemName,
  itemType,
  loading = false,
}: DeleteStockModalProps) {
  const itemTypeLabel = itemType === "medicamento" ? "medicamento" : "insumo";

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Confirmar Exclusão
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 pt-2">
            Tem certeza que deseja remover este {itemTypeLabel} do estoque?
          </DialogDescription>
        </DialogHeader>

        {itemName && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-1">Item:</p>
            <p className="text-sm text-slate-700">{itemName}</p>
          </div>
        )}

        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita. O item será
            permanentemente removido do estoque.
          </p>
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? "Removendo..." : "Sim, remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

