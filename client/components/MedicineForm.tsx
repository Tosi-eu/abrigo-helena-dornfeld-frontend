import { useState } from "react";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { MedicineFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast.hook";
import { MedicineStockType, OriginType, StockTypeLabels } from "@/utils/enums";

export function MedicineForm({
  medicines,
  caselas,
  cabinets,
  onSubmit,
}: MedicineFormProps) {
  const [formData, setFormData] = useState({
    id: null as number | null,
    quantity: "",
    stockType: "" as MedicineStockType | "",
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
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate)
        : null,
    });
  };

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
        <select
          value={formData.id ?? ""}
          onChange={(e) =>
            updateField("id", e.target.value ? Number(e.target.value) : null)
          }
          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
        >
          <option value="" disabled hidden>
            Selecione
          </option>

          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} {m.dosage} {m.measurementUnit}
            </option>
          ))}
        </select>
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
            placeholder="10"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
            placeholderText="Selecione a data"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
            placeholder="Nome do residente"
            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Armário
          </label>
          <select
            value={formData.cabinet ?? ""}
            onChange={(e) => updateField("cabinet", Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
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

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Origem</label>
          <select
            value={formData.origin}
            onChange={(e) =>
              updateField("origin", e.target.value as OriginType)
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
