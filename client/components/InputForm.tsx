import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";

import { InputFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast.hook";
import { InputStockType, StockTypeLabels } from "@/utils/enums";

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

export function InputForm({ inputs, cabinets, drawers, onSubmit }: InputFormProps) {
  const [formData, setFormData] = useState({
    inputId: 0,
    category: "",
    quantity: 0,

    storageId: 0,
    caselaId: 0,

    validity: null as Date | null,
    stockType: "" as InputStockType | "",
  });

  const [inputOpen, setInputOpen] = useState(false);

  const navigate = useNavigate();

  const selectedInput = inputs.find((i) => i.id === formData.inputId);

  const isEmergencyCart =
    formData.stockType === InputStockType.CARRINHO;

  const handleInputSelect = (id: number) => {
    const selected = inputs.find((i) => i.id === id);

    setFormData((prev) => ({
      ...prev,
      inputId: id,
      category: selected?.description ?? "",
    }));

    setInputOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.inputId) {
      toast({ title: "Selecione um insumo", variant: "error" });
      return;
    }

    if (!formData.storageId) {
      toast({
        title: `Selecione ${isEmergencyCart ? "uma gaveta" : "um armário"}`,
        variant: "error",
      });
      return;
    }

    const quantity = Number(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Informe uma quantidade válida", variant: "error" });
      return;
    }

    onSubmit({
      inputId: formData.inputId,
      quantity,
      isEmergencyCart,
      caselaId: formData.caselaId || undefined,
      validity: formData.validity,
      stockType: formData.stockType,
    });
  };

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
                {inputs.map((input) => (
                  <CommandItem
                    key={input.id}
                    value={input.name}
                    onSelect={() => handleInputSelect(input.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.inputId === input.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {input.name}
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
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) || 0 })
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Validade
          </label>
          <DatePicker
            selected={formData.validity}
            onChange={(date: Date | null) =>
              setFormData({ ...formData, validity: date })
            }
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          {isEmergencyCart ? "Gaveta" : "Armário"}
        </label>

        <select
          value={formData.storageId}
          onChange={(e) =>
            setFormData({
              ...formData,
              storageId: Number(e.target.value),
            })
          }
          className="w-full border bg-white border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value={0} disabled hidden>
            Selecione
          </option>

          {(isEmergencyCart ? drawers : cabinets).map((s: any) => (
            <option
              key={isEmergencyCart ? s.id : s.numero}
              value={isEmergencyCart ? s.id : s.numero}
            >
              {isEmergencyCart ? s.nome ?? s.id : s.numero}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Tipo de Estoque
        </label>
        <select
          value={formData.stockType}
          onChange={(e) =>
            setFormData({
              ...formData,
              stockType: e.target.value as InputStockType,
            })
          }
          className="w-full border bg-white border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {Object.values(InputStockType).map((type) => (
            <option key={type} value={type}>
              {StockTypeLabels[type]}
            </option>
          ))}
        </select>
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

