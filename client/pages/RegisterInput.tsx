import { useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import LoadingModal from "@/components/LoadingModal";
import { createInput } from "@/api/requests";

export default function RegisterInput() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para cadastrar o Insumo.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await createInput(formData.name, formData.category);
      toast({
        title: "Insumo cadastrado",
        description: `${formData.name} foi adicionado ao sistema.`,
        variant: "success",
      });

      setFormData({ name: "", category: "" });
      navigate("/inputs");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao cadastrar insumo",
        description: "Não foi possível salvar o insumo no banco.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Cadastro de Insumo">
      <LoadingModal
        open={saving}
        title="Aguarde"
        description="Cadastrando insumo..."
      />

      <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Cadastrar Insumo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            {
              label: "Nome do Insumo",
              field: "name",
              placeholder: "Seringa 5ml",
            },
            {
              label: "Categoria",
              field: "category",
              placeholder: "Material de Injeção",
            },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={formData[field as keyof typeof formData]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                placeholder={placeholder}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                disabled={saving}
              />
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/inputs")}
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
              {saving ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
