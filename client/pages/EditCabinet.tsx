import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { CabinetCategory } from "@/enums/enums";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import LoadingModal from "@/components/LoadingModal";
import { getCabinets, updateCabinet } from "@/api/requests";

export default function EditCabinet() {
  const location = useLocation();
  const item = location.state?.item;
  const navigate = useNavigate();

  const [cabinets, setCabinets] = useState<any[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: 0,
    category: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCabinets()
      .then((data) => setCabinets(data))
      .catch(() => {
        toast({
          title: "Erro ao carregar armários",
          description: "Não foi possível buscar os armários do servidor.",
          variant: "error",
        });
      });
  }, []);

  useEffect(() => {
    if (item) {
      setSelectedCabinet(item);
      setFormData({
        id: item.numero,
        category: item.categoria,
      });
    }
  }, [item]);

  const handleSelectChange = (value: string) => {
    const cabinet = cabinets.find((c) => c.numero === parseInt(value, 10));
    if (cabinet) {
      setSelectedCabinet(cabinet);
      setFormData({
        id: cabinet.numero,
        category: cabinet.categoria,
      });
    } else {
      setSelectedCabinet(null);
      setFormData({ id: 0, category: "" });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedCabinet) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um armário para editar.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      await updateCabinet(selectedCabinet.numero, {
        numero: formData.id,
        categoria: formData.category,
      });

      toast({
        title: "Armário atualizado",
        description: `O armário ${formData.id} foi atualizado com sucesso!`,
        variant: "success",
      });

      navigate("/cabinets");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao editar armário",
        description: "Não foi possível atualizar o armário.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Editar Armário">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Atualizando armário..."
      />

      <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Edição de Armário
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Selecionar Armário
          </label>
          <select
            value={selectedCabinet?.numero || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-300 focus:outline-none"
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            {cabinets.map((c) => (
              <option key={c.numero} value={c.numero}>
                Armário {c.numero} ({c.categoria})
              </option>
            ))}
          </select>
        </div>

        {selectedCabinet && (
          <div className="space-y-5 pt-4 border-t border-slate-100">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número do Armário
              </label>
              <input
                type="number"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full border bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none"
              >
                {Object.entries(CabinetCategory).map(([key, label]) => (
                  <option key={key} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/cabinets")}
                className="px-5 py-2 border border-slate-400 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition disabled:opacity-50"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
