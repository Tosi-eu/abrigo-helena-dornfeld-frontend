import { useState } from "react";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { OriginType, StockType, StockTypeLabels } from "@/enums/enums";
import { useNavigate } from "react-router-dom";
import { MedicineFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast";

export function MedicineForm({
  medicines,
  caselas,
  cabinets,
  onSubmit,
}: MedicineFormProps) {
  const [formData, setFormData] = useState({
    id: null as number | null,
    quantity: "",
    stockType: "" as StockType | "",
    expirationDate: null as Date | null,
    resident: "",
    casela: null as number | null,
    cabinet: null as number | null,
    origin: "" as OriginType | "",
  });

  const navigate = useNavigate();

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCaselaChange = (value: number) => {
    const selected = caselas.find((c) => c.casela === value);
    setFormData((prev) => ({
      ...prev,
      casela: value,
      resident: selected ? selected.name : "",
    }));
  };

  const handleSubmit = () => {
    const quantity = Number(formData.quantity);

    if (!formData.id) {
      toast({ title: "Selecione um medicamento", variant: "error" });
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Informe uma quantidade válida", variant: "error" });
      return;
    }

    if (!formData.cabinet) {
      toast({ title: "Selecione um armário", variant: "error" });
      return;
    }

    if (formData.stockType === StockType.GERAL && formData.casela) {
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
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate)
        : null,
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Medicamento
        </label>
        <select
          value={formData.id ?? ""}
          onChange={(e) =>
            updateField("id", e.target.value ? Number(e.target.value) : null)
          }
          className="w-full border bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {medicines.map((med) => (
            <option key={med.id} value={med.id}>
              {med.name} {med.dosage} {med.measurementUnit}
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
            type="number"
            value={formData.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            placeholder="10"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Validade
          </label>
          <DatePicker
            selected={formData.expirationDate}
            onChange={(date: Date | null) =>
              updateField("expirationDate", date)
            }
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione a data"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tipo de estoque
        </label>

        <select
          value={formData.stockType}
          onChange={(e) =>
            updateField("stockType", e.target.value as StockType)
          }
          className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-sky-300 focus:outline-none"
        >
          <option value="" disabled hidden>
            Selecione
          </option>

          {Object.values(StockType).map((type) => (
            <option key={type} value={type}>
               {StockTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Casela
          </label>
          <select
            value={formData.casela ?? ""}
            onChange={(e) => handleCaselaChange(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-sky-300 focus:outline-none"
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

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Residente
          </label>
          <input
            type="text"
            value={formData.resident}
            readOnly
            placeholder="Nome do residente"
            className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 text-sm text-slate-600"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Armário
          </label>
          <select
            value={formData.cabinet ?? ""}
            onChange={(e) => updateField("cabinet", Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-sky-300 focus:outline-none"
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            {cabinets.map((c) => (
              <option key={c.numero} value={c.numero}>
                {c.numero}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Origem
          </label>
          <select
            value={formData.origin}
            onChange={(e) => updateField("origin", e.target.value as OriginType)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-sky-300 focus:outline-none"
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            {Object.values(OriginType).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
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
