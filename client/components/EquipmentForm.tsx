import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast.hook";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { InputStockType, StockTypeLabels } from "@/utils/enums";

export function InputForm({ inputs, cabinets, onSubmit }: InputFormProps) {
  const [formData, setFormData] = useState({
    inputId: 0,
    category: "",
    quantity: 0,
    cabinetId: 0,
    caselaId: 0,
    validity: null as Date | null,
    stockType: "" as InputStockType | "",
  });

  const navigate = useNavigate();

  const handleInputChange = (id: number) => {
    const selected = inputs.find((i) => i.id === id);
    setFormData({
      ...formData,
      inputId: id,
      category: selected ? selected.description : "",
    });
  };

  const handleSubmit = () => {
    if (!formData.inputId) {
      toast({ title: "Selecione um insumo", variant: "error" });
      return;
    }

    if (!formData.cabinetId) {
      toast({ title: "Selecione um armário", variant: "error" });
      return;
    }

    const quantity = Number(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Informe uma quantidade válida", variant: "error" });
      return;
    }

    onSubmit({
      inputId: formData.inputId,
      cabinetId: formData.cabinetId,
      caselaId: formData.caselaId || undefined,
      quantity,
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
        <label className="text-sm font-semibold text-slate-700">Nome do Insumo</label>
        <select
          value={formData.inputId}
          onChange={(e) => handleInputChange(Number(e.target.value))}
          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
        >
          <option value={0} disabled hidden>Selecione</option>
          {inputs.map((input) => (
            <option key={input.id} value={input.id}>
              {input.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Quantidade</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
            }
            placeholder="10"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Validade</label>
          <DatePicker
            selected={formData.validity}
            onChange={(date: Date | null) =>
              setFormData({ ...formData, validity: date })
            }
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione a data"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">Armário</label>
        <select
          value={formData.cabinetId}
          onChange={(e) =>
            setFormData({ ...formData, cabinetId: Number(e.target.value) })
          }
          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
        >
          <option value={0} disabled hidden>Selecione</option>
          {cabinets.map((cab) => (
            <option key={cab.numero} value={cab.numero}>
              {cab.numero}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">Tipo de Estoque</label>

        <select
          value={formData.stockType}
          onChange={(e) =>
            setFormData({ ...formData, stockType: e.target.value as InputStockType })
          }
          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
        >
          <option value="" disabled hidden>Selecione</option>

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
          className="px-5 py-2 border border-slate-400 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
          onClick={() => navigate("/stock")}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}