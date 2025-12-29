import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";

import { InputFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast.hook";
import { InputStockType, StockTypeLabels, SectorType } from "@/utils/enums";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function InputForm({
  inputs,
  cabinets,
  drawers,
  onSubmit,
}: InputFormProps) {
  const [formData, setFormData] = useState({
    inputId: null as number | null,
    category: "",
    quantity: "",
    stockType: "" as InputStockType | "",
    validity: null as Date | null,
    cabinetId: null as number | null,
    drawerId: null as number | null,
    sector: "" as SectorType | "",
    lot: ""
  });

  const [inputOpen, setInputOpen] = useState(false);
  const navigate = useNavigate();

  const selectedInput = inputs.find((i) => i.id === formData.inputId);
  const isEmergencyCart = formData.stockType === InputStockType.CARRINHO;

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isEmergencyCart) {
      setFormData((prev) => ({
        ...prev,
        sector: SectorType.ENFERMAGEM,
      }));
    }
  }, [isEmergencyCart]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, cabinetId: null, drawerId: null }));
  }, [formData.stockType]);

  const handleInputSelect = (id: number) => {
    const selected = inputs.find((i) => i.id === id);
    updateField("inputId", id);
    updateField("category", selected?.description ?? "");
    setInputOpen(false);
  };

  const handleSubmit = () => {
    const quantity = Number(formData.quantity);

    if (!formData.inputId) {
      toast({ title: "Selecione um insumo", variant: "error" });
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Informe uma quantidade válida", variant: "error" });
      return;
    }

    if (isEmergencyCart && !formData.drawerId) {
      toast({ title: "Selecione uma gaveta", variant: "error" });
      return;
    }

    if (!isEmergencyCart && !formData.cabinetId) {
      toast({ title: "Selecione um armário", variant: "error" });
      return;
    }

    onSubmit({
      inputId: formData.inputId,
      quantity,
      isEmergencyCart,
      drawerId: formData.drawerId || undefined,
      cabinetId: formData.cabinetId || undefined,
      validity: formData.validity,
      stockType: formData.stockType,
      sector: formData.sector,
      lot: formData.lot
    });
  };

  const storageOptions = isEmergencyCart ? drawers : cabinets;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
      <div className="bg-sky-50 px-4 py-3 rounded-lg border border-sky-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Informações do Insumo
        </h2>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Nome do Insumo
        </label>
        <Popover open={inputOpen} onOpenChange={setInputOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedInput ? selectedInput.name : "Selecione o insumo"}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar insumo..." />
              <CommandEmpty>Nenhum insumo encontrado.</CommandEmpty>
              <CommandGroup>
                {inputs.map((i) => (
                  <CommandItem
                    key={i.id}
                    value={i.name}
                    onSelect={() => handleInputSelect(i.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.inputId === i.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {i.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Quantidade
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Validade
          </label>
          <DatePicker
            selected={formData.validity}
            onChange={(date: Date | null) => updateField("validity", date)}
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Tipo de Estoque
        </label>
        <select
          value={formData.stockType}
          onChange={(e) =>
            updateField("stockType", e.target.value as InputStockType)
          }
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {Object.values(InputStockType).map((t) => (
            <option key={t} value={t}>
              {StockTypeLabels[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          {isEmergencyCart ? "Gaveta" : "Armário"}
        </label>
        <select
          value={
            isEmergencyCart
              ? (formData.drawerId ?? "")
              : (formData.cabinetId ?? "")
          }
          onChange={(e) =>
            isEmergencyCart
              ? updateField("drawerId", Number(e.target.value))
              : updateField("cabinetId", Number(e.target.value))
          }
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {storageOptions.map((s) => (
            <option key={s.numero} value={s.numero}>
              {s.numero}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">Setor</label>
        <select
          value={formData.sector}
          onChange={(e) => updateField("sector", e.target.value as SectorType)}
          disabled={isEmergencyCart}
          className={cn(
            "w-full border rounded-lg px-3 py-2 text-sm bg-white",
            isEmergencyCart
              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300",
          )}
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {Object.values(SectorType).map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Lote
        </label>
        <input
          type="text"
          value={formData.lot}
          onChange={(e) => updateField("lot", e.target.value)}
          placeholder="Ex: L2024-01"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate("/stock")}
          className="px-5 py-2 border border-slate-400 rounded-lg text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
