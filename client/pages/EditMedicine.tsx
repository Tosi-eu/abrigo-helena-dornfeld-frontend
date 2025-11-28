import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import LoadingModal from "@/components/LoadingModal";
import { updateMedicine } from "@/api/requests";

export default function EditMedicine() {
  const location = useLocation();
  const navigate = useNavigate();

  const [medicineId, setMedicineId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    principio_ativo: "",
    dosagem: "",
    unidade_medida: "" as string | null,
    estoque_minimo: 0,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state?.item) {
      const item = location.state.item;

      setMedicineId(item.id);

      setFormData({
        nome: item.nome || "",
        principio_ativo: item.principio_ativo || "",
        dosagem: item.dosagem || "",
        unidade_medida: item.unidade_medida || null,
        estoque_minimo: item.estoque_minimo || 0,
      });
    }
  }, [location.state]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicineId) {
      toast({
        title: "Erro",
        description: "Medicamento não identificado.",
        variant: "error",
      });
      return;
    }

    setSaving(true);

    try {
      await updateMedicine(medicineId, {
        ...formData,
        unidade_medida: formData.unidade_medida || null,
      });

      toast({
        title: "Medicamento atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`,
        variant: "success",
      });

      navigate("/medicines");
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Erro inesperado ao salvar alterações.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Edição de Medicamento">
      <LoadingModal
        open={saving}
        title="Aguarde"
        description="Atualizando medicamento..."
      />

      <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm font-[Inter]">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Editar Medicamento
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do medicamento
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Princípio Ativo
            </label>
            <input
              type="text"
              value={formData.principio_ativo}
              onChange={(e) => handleChange("principio_ativo", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              disabled={saving}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dosagem
              </label>
              <input
                type="text"
                value={formData.dosagem}
                onChange={(e) => handleChange("dosagem", e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
                disabled={saving}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unidade de medida
              </label>
              <select
                value={formData.unidade_medida ?? ""}
                onChange={(e) =>
                  handleChange("unidade_medida", e.target.value || null)
                }
                className="w-full border bg-white border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
                disabled={saving}
              >
                <option value="" disabled hidden>
                  Unidade
                </option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="mcg">mcg</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estoque mínimo
            </label>
            <input
              type="number"
              value={formData.estoque_minimo}
              onChange={(e) =>
                handleChange("estoque_minimo", Number(e.target.value))
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              disabled={saving}
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/medicines")}
              className="px-5 py-2 border border-slate-400 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
