import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";

export function InputForm({ inputs, cabinets, onSubmit }: InputFormProps) {
  const [formData, setFormData] = useState({
    inputId: 0,
    category: "",
    quantity: 0,
    cabinetId: 0,
    caselaId: 0,
    validity: null as Date
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

  const handleCabinetChange = (id: number) => {
    setFormData({
      ...formData,
      cabinetId: id,
    });
  };

  const handleSubmit = () => {
    if (!formData.inputId) {
      toast({ title: "Selecione um input", variant: "error" });
      return;
    }

    if (!formData.cabinetId) {
      toast({ title: "Selecione um armário", variant: "error" });
      return;
    }

    const quantity = Number(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Informe uma quantity válida", variant: "error" });
      return;
    }

    onSubmit({
      inputId: formData.inputId,
      cabinetId: formData.cabinetId,
      caselaId: formData.caselaId || undefined,
      quantity: quantity,
      validity: formData.validity
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nome do Insumo
        </label>
        <select
          value={formData.inputId}
          onChange={(e) => handleInputChange(parseInt(e.target.value))}
          className="w-full border bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
        >
          <option value={0} disabled hidden>
            Selecione
          </option>

          {inputs.map((input) => (
            <option key={input.id} value={input.id}>
              {input.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quantidade
          </label>
          <input
            type="text"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            placeholder="10"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Validade
        </label>
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Armário
        </label>
        <select
          value={formData.cabinetId}
          onChange={(e) => handleCabinetChange(parseInt(e.target.value))}
          className="w-full border bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
        >
          <option value={0} disabled hidden>
            Selecione
          </option>
          {cabinets.map((cab) => (
            <option key={cab.numero} value={cab.numero}>
              {cab.numero}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="px-5 py-2 border border-slate-400 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition mr-2"
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
