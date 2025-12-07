import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";
import LoadingModal from "@/components/LoadingModal";
import { createCabinet, createCabinetCategory, getCabinetCategories } from "@/api/requests";
import { CabinetCategory } from "@/interfaces/interfaces";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function RegisterCabinet() {
  const [id, setId] = useState<number>(0);
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState<CabinetCategory[]>([]);
  const [page, setPage] = useState(1);

  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories(page);
  }, [page]);

  const loadCategories = async (p: number) => {
    try {
      const res = await getCabinetCategories(p, 100);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "error",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (id === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe um número de armário válido.",
        variant: "warning",
      });
      return;
    }

    if (!category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe uma categoria.",
        variant: "warning",
      });
      return;
    }

    const existing = categories.find((c) => c.nome === category);

    if (!existing) {
      setModalOpen(true);
      return;
    }

    // Senão, segue cadastro normalmente
    await createCabinetFlow(existing.id);
  };

  const createCabinetFlow = async (categoryId?: number) => {
    setSaving(true);
    try {
      let finalCategoryId: number;

      if (categoryId) {
        finalCategoryId = categoryId;
      } else {
        const createRes = await createCabinetCategory(category);
        finalCategoryId = createRes?.id;
      }

      await createCabinet(id, finalCategoryId);

      toast({
        title: "Armário criado",
        description: `O armário ${id} foi cadastrado com sucesso.`,
        variant: "success",
      });

      navigate("/cabinets");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o armário.",
        variant: "error",
      });
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  };

  return (
    <Layout title="Cadastrar Armário">
      <LoadingModal
        open={saving}
        title="Aguarde"
        description="Cadastrando armário..."
      />

      <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Cadastro de Armário</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número do Armário */}
          <div>
            <label className="block text-sm font-medium mb-1">Número do Armário</label>
            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value ===  "0" ? 0 : parseInt(e.target.value))}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Ex: 4"
              disabled={saving}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>

            <input
              list="categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Selecione ou digite uma categoria"
              disabled={saving}
            />

            <datalist id="categories">
              {categories.map((c) => (
                <option key={c.id} value={c.nome} />
              ))}
            </datalist>
          </div>

          {/* Botões */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/cabinets")}
              className="px-5 py-2 border rounded-lg text-sm"
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        open={modalOpen}
        categoryName={category}
        onConfirm={() => createCabinetFlow()}
        onCancel={() => setModalOpen(false)}
      />
    </Layout>
  );
}