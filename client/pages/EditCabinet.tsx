import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";
import LoadingModal from "@/components/LoadingModal";
import { getCabinets, updateCabinet, getCabinetCategories } from "@/api/requests";
import { Cabinet } from "@/interfaces/interfaces";

export default function EditCabinet() {
  const location = useLocation();
  const navigate = useNavigate();

  const item = location.state?.item as Cabinet | undefined;

  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [categories, setCategories] = useState<{ id: number; nome: string }[]>([]);
  const [formData, setFormData] = useState({ id: 0, categoryId: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCabinets()
      .then((data) => setCabinets(data))
      .catch(() =>
        toast({
          title: "Erro ao carregar armários",
          description: "Não foi possível buscar os armários do servidor.",
          variant: "error",
        })
      );
  }, []);

  useEffect(() => {
    getCabinetCategories(1, 200)
      .then((res) => setCategories(res.data))
      .catch(() =>
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "error",
        })
      );
  }, []);

  useEffect(() => {
    if (item && cabinets.length > 0 && categories.length > 0) {
      const cab = cabinets.find((c) => c.numero === item.numero);

      if (cab) {
        const matchedCategory = categories.find((c) => c.nome === cab.categoria);

        setFormData({
          id: cab.numero,
          categoryId: matchedCategory?.id,
        });
      }
    }
  }, [item, cabinets, categories]);

  const handleSelectChange = (value: string) => {
    const cab = cabinets.find((c) => c.numero === Number(value));

    if (!cab) {
      setFormData({ id: 0, categoryId: 0 });
      return;
    }

    const matchedCategory = categories.find((c) => c.nome === cab.categoria);

    setFormData({
      id: cab.numero,
      categoryId: matchedCategory?.id ?? 0,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.id || !formData.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um armário e uma categoria.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      await updateCabinet(formData.id, {
        numero: formData.id,
        categoria_id: formData.categoryId,
      });

      toast({
        title: "Armário atualizado",
        description: `O armário ${formData.id} foi atualizado com sucesso.`,
        variant: "success",
      });

      navigate("/cabinets");
    } catch {
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
            value={formData.id || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-sm focus:ring-2 focus:ring-sky-300"
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

        {formData.id !== 0 && (
          <div className="space-y-5 pt-4 border-t border-slate-100">

            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input
                type="number"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => navigate("/cabinets")}
                className="px-5 py-2 border rounded-lg text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm"
                disabled={loading}
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}