import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

import { MedicineFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast.hook";
import {
  validateNumberInput,
  validateTextInput,
  sanitizeInput,
} from "@/helpers/validation.helper";
import {
  MedicineStockType,
  OriginType,
  SectorType,
  StockTypeLabels,
} from "@/utils/enums";

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

export function MedicineForm({
  medicines,
  caselas,
  cabinets,
  drawers,
  onSubmit,
}: MedicineFormProps) {
  const [formData, setFormData] = useState({
    id: null as number | null,
    quantity: "",
    stockType: "" as MedicineStockType | "",
    expirationDate: null as Date | null,
    resident: "",
    casela: null as number | null,
    cabinetId: null as number | null,
    drawerId: null as number | null,
    origin: "" as OriginType | "",
    sector: "" as SectorType | "",
    lot: "",
  });

  const [medicineOpen, setMedicineOpen] = useState(false);
  const navigate = useNavigate();

  const selectedMedicine = medicines.find((m) => m.id === formData.id);
  const isEmergencyCart = formData.stockType === MedicineStockType.CARRINHO;

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
    setFormData((prev) => ({
      ...prev,
      cabinetId: null,
      drawerId: null,
    }));
  }, [formData.stockType]);

  const handleCaselaChange = (value: number) => {
    const selected = caselas.find((c) => c.casela === value);
    setFormData((prev) => ({
      ...prev,
      casela: value,
      resident: selected ? selected.name : "",
    }));
  };

  const handleMedicineSelect = (id: number) => {
    updateField("id", id);
    setMedicineOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.id) {
      toast({ title: "Selecione um medicamento", variant: "error" });
      return;
    }

    const quantityValidation = validateNumberInput(formData.quantity, {
      min: 1,
      max: 999999,
      required: true,
      fieldName: "Quantidade",
    });

    if (!quantityValidation.valid || !quantityValidation.value) {
      toast({
        title: "Erro de validação",
        description: quantityValidation.error || "Informe uma quantidade válida",
        variant: "error",
      });
      return;
    }

    if (formData.lot) {
      const lotValidation = validateTextInput(formData.lot, {
        maxLength: 100,
        required: false,
        fieldName: "Lote",
      });

      if (!lotValidation.valid) {
        toast({
          title: "Erro de validação",
          description: lotValidation.error,
          variant: "error",
        });
        return;
      }
    }

    const quantity = quantityValidation.value;

    if (isEmergencyCart && !formData.drawerId) {
      toast({ title: "Selecione uma gaveta", variant: "error" });
      return;
    }

    if (!isEmergencyCart && !formData.cabinetId) {
      toast({ title: "Selecione um armário", variant: "error" });
      return;
    }

    if (formData.stockType === MedicineStockType.GERAL && formData.casela) {
      toast({
        title: "Erro de seleção",
        description: "Não é possível selecionar uma casela para estoque geral.",
        variant: "error",
      });
      return;
    }

    onSubmit({
      ...formData,
      quantity,
      lot: formData.lot ? sanitizeInput(formData.lot) : undefined,
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate)
        : null,
      isEmergencyCart,
    });
  };

  const storageOptions = isEmergencyCart ? drawers : cabinets;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
      <div className="bg-sky-50 px-4 py-3 rounded-lg border border-sky-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Informações do Medicamento
        </h2>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Medicamento
        </label>
        <Popover open={medicineOpen} onOpenChange={setMedicineOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between bg-white"
            >
              {selectedMedicine
                ? `${selectedMedicine.name} ${selectedMedicine.dosage} ${selectedMedicine.measurementUnit}`
                : "Selecione o medicamento"}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar medicamento..." />
              <CommandEmpty>Nenhum medicamento encontrado.</CommandEmpty>
              <CommandGroup>
                {medicines.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={`${m.name} ${m.dosage} ${m.measurementUnit}`}
                    onSelect={() => handleMedicineSelect(m.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.id === m.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {m.name} {m.dosage} {m.measurementUnit}
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
            onChange={(e) => updateField("quantity", e.target.value.replace(/[^0-9]/g, ""))}
            min={1}
            max={999999}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Validade
          </label>
          <DatePicker
            selected={formData.expirationDate}
            onChange={(date: Date | null) =>
              updateField("expirationDate", date)
            }
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Tipo de estoque
        </label>
        <select
          value={formData.stockType}
          onChange={(e) =>
            updateField("stockType", e.target.value as MedicineStockType)
          }
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {Object.values(MedicineStockType).map((t) => (
            <option key={t} value={t}>
              {StockTypeLabels[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Casela</label>
          <select
            value={formData.casela ?? ""}
            onChange={(e) => handleCaselaChange(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            {caselas.map((c) => (
              <option key={c.casela} value={c.casela}>
                {c.casela}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Residente
          </label>
          <input
            type="text"
            value={formData.resident}
            readOnly
            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="text-sm font-semibold text-slate-700">Origem</label>
          <select
            value={formData.origin}
            onChange={(e) =>
              updateField("origin", e.target.value as OriginType)
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            {Object.values(OriginType).map((o) => (
              <option key={o} value={o}>
                {o.charAt(0) + o.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
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
              {sector === SectorType.FARMACIA ? "Farmácia" : "Enfermagem"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">Lote</label>
        <input
          type="text"
          value={formData.lot}
          onChange={(e) => updateField("lot", sanitizeInput(e.target.value))}
          maxLength={100}
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
