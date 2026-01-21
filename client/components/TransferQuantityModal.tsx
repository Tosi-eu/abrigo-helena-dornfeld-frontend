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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronDown } from "lucide-react";

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
  onConfirm: (
    quantity: number,
    casela?: number | null,
    destino?: string | null
  ) => void;
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
  const [quantity, setQuantity] = useState("");
  const [selectedCasela, setSelectedCasela] = useState("");
  const [caselaOpen, setCaselaOpen] = useState(false);
  const [caselaSearch, setCaselaSearch] = useState("");
  const [destination, setDestination] = useState("");

  const needsCasela = item?.isGeneralMedicine === true;

  useEffect(() => {
    if (open) {
      setQuantity("");
      setSelectedCasela("");
      setDestination("");
      setCaselaSearch("");
    }
  }, [open]);

  const maxQuantity = item?.quantity || 0;
  const quantityNum = parseInt(quantity, 10);

  const hasDestination = destination.trim().length > 0;
  const hasCasela = selectedCasela !== "";

  const hasValidTarget =
    hasDestination || (needsCasela && hasCasela);

  const isValid =
    quantityNum > 0 &&
    quantityNum <= maxQuantity &&
    hasValidTarget;

  const handleConfirm = () => {
    if (!isValid) return;

    const casela =
      hasDestination ? null : hasCasela ? Number(selectedCasela) : null;

    const destino = hasDestination ? destination.trim() : null;

    onConfirm(quantityNum, casela, destino);
  };

  const filteredResidents = residents.filter((r) => {
    if (!caselaSearch) return true;

    if (/^\d+$/.test(caselaSearch)) {
      return r.casela === Number(caselaSearch);
    }

    return r.name.toLowerCase().includes(caselaSearch.toLowerCase());
  });

  const nextSector =
    item?.sector === "farmacia" ? "enfermagem" : "farmacia";

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>
            Transferir para{" "}
            {nextSector === "farmacia" ? "Farmácia" : "Enfermaria"}
          </DialogTitle>
          <DialogDescription>
            Quantas unidades deseja transferir?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Quantidade disponível:{" "}
              <span className="font-semibold">{maxQuantity}</span>
            </Label>

            <Input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Destino</Label>
            <Input
              placeholder="Digite o destino"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedCasela("");
                }
              }}
              disabled={loading}
            />
          </div>

          {needsCasela && (
            <div className="space-y-2">
              <Label>Casela</Label>

              <Popover open={caselaOpen} onOpenChange={setCaselaOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={loading || hasDestination}
                    className="w-full justify-between"
                  >
                    {selectedCasela
                      ? `Casela ${selectedCasela} - ${
                          residents.find(
                            (r) => r.casela === Number(selectedCasela)
                          )?.name
                        }`
                      : "Selecione uma casela..."}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar por casela ou nome"
                      value={caselaSearch}
                      onValueChange={setCaselaSearch}
                    />
                    <CommandEmpty>Nenhuma casela encontrada.</CommandEmpty>
                    <CommandGroup>
                      {filteredResidents.map((resident) => (
                        <CommandItem
                          key={resident.casela}
                          onSelect={() => {
                            setSelectedCasela(
                              resident.casela.toString()
                            );
                            setDestination("");
                            setCaselaOpen(false);
                            setCaselaSearch("");
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedCasela ===
                              resident.casela.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          Casela {resident.casela} – {resident.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {!hasValidTarget && quantity && (
            <p className="text-sm text-red-500">
              Informe um destino ou selecione uma casela
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !isValid}
          >
            Confirmar Transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferQuantityModal;