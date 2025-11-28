import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import LoadingModal from "@/components/LoadingModal";
import { updateInput } from "@/api/requests";

export default function EditInput() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    descricao: "",
  });

  useEffect(() => {
    const item = location.state?.item;

    if (!item || !item.id) {
      toast({
        title: "Erro",
        description: "Nenhum insumo foi selecionado para edição.",
        variant: "error",
      });
      navigate("/inputs");
      return;
    }

    setFormData({
      id: item.id,
      nome: item.nome || "",
      descricao: item.descricao || "",
    });

    setLoading(false);
  }, [location.state, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do insumo é obrigatório.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await updateInput(parseInt(formData.id), {
        nome: formData.nome,
        descricao: formData.descricao,
      });

      toast({
        title: "Insumo atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`,
        variant: "success",
      });

      navigate("/inputs");
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o insumo.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edição de Insumo">
        <div className="flex justify-center items-center h-64 text-slate-500">
          Carregando informações...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edição de Insumo">
      <LoadingModal
        open={saving}
        title="Aguarde"
        description="Atualizando insumo..."
      />

      <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Editar Insumo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Insumo
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              placeholder="Ex: Seringa 5ml"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              placeholder="Ex: Material de injeção"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/inputs")}
              className="px-5 py-2 border border-slate-400 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
