import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransferQuantityModalProps {
  open: boolean;
  item: {
    name: string;
    quantity: number;
    sector: string;
    itemType?: string;
    isGeneralMedicine?: boolean;
  } | null;
  residents?: Array<{ casela: number; name: string }>;
  onConfirm: (quantity: number, casela?: number | null) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TransferQuantityModal: FC<TransferQuantityModalProps> = ({
  open,
  item,
  residents = [],
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [quantity, setQuantity] = useState<string>("");
  const [selectedCasela, setSelectedCasela] = useState<string>("");

  const needsCasela = item?.isGeneralMedicine === true;

  useEffect(() => {
    if (open && item) {
      setQuantity("");
      setSelectedCasela("");
    }
  }, [open, item]);

  const handleConfirm = () => {
    const qty = parseInt(quantity, 10);

    if (qty > 0 && qty <= (item?.quantity || 0)) {
      const casela =
        needsCasela && selectedCasela ? parseInt(selectedCasela, 10) : null;

      onConfirm(qty, casela);
    }
  };

  const nextSector = item?.sector === "farmacia" ? "enfermagem" : "farmacia";

  const maxQuantity = item?.quantity || 0;
  const quantityNum = parseInt(quantity, 10);

  const isValid =
    quantityNum > 0 &&
    quantityNum <= maxQuantity &&
    (!needsCasela || selectedCasela !== "");

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Transferir para{" "}
            {nextSector === "farmacia" ? "Farmácia" : "Enfermaria"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Quantas unidades deseja transferir?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-slate-700">
              Quantidade disponível:{" "}
              <span className="font-semibold">{maxQuantity}</span>
            </Label>

            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Digite a quantidade"
              disabled={loading}
              className="w-full"
            />

            {quantity && !isValid && (
              <p className="text-sm text-red-500">
                A quantidade deve ser entre 1 e {maxQuantity}
              </p>
            )}
          </div>

          {needsCasela && (
            <div className="space-y-2">
              <Label htmlFor="casela" className="text-slate-700">
                Casela/Residente <span className="text-red-500">*</span>
              </Label>

              <select
                id="casela"
                value={selectedCasela}
                onChange={(e) => setSelectedCasela(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100"
              >
                <option value="">Selecione uma casela...</option>
                {residents.map((resident) => (
                  <option key={resident.casela} value={resident.casela}>
                    Casela {resident.casela} - {resident.name}
                  </option>
                ))}
              </select>

              {!selectedCasela && quantity && (
                <p className="text-sm text-red-500">
                  Selecione uma casela para continuar
                </p>
              )}
            </div>
          )}

          {item && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p>
                <span className="font-semibold">{item.name}</span>
              </p>

              <p className="mt-1">Após a transferência:</p>

              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  <span className="font-semibold">{quantityNum || 0}</span>{" "}
                  unidades em{" "}
                  {nextSector === "farmacia" ? "Farmácia" : "Enfermaria"}
                  {needsCasela &&
                    selectedCasela &&
                    ` (Casela ${selectedCasela})`}
                </li>

                {maxQuantity - (quantityNum || 0) > 0 && (
                  <li>
                    <span className="font-semibold">
                      {maxQuantity - (quantityNum || 0)}
                    </span>{" "}
                    unidades permanecerão em{" "}
                    {item.sector === "farmacia" ? "Farmácia" : "Enfermaria"}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading || !isValid}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            {loading ? "Transferindo..." : "Confirmar Transferência"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferQuantityModal;
