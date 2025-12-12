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
      <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
        Cadastro de Armário
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="flex flex-col justify-center">
          <label className="block text-sm font-medium text-slate-700 mb-1 text-left">
            Número do Armário
          </label>
          <input
            type="number"
            value={id}
            onChange={(e) =>
              setId(e.target.value === "0" ? 0 : parseInt(e.target.value))
            }
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none text-left"
            placeholder="Ex: 4"
            disabled={saving}
          />
        </div>

        <div className="flex flex-col justify-center">
          <label className="block text-sm font-medium text-slate-700 mb-1 text-left">
            Categoria
          </label>

          <input
            list="categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-300 focus:outline-none text-left"
            placeholder="Selecione ou digite uma categoria"
            disabled={saving}
          />

          <datalist id="categories">
            {categories.map((c) => (
              <option key={c.id} value={c.nome} />
            ))}
          </datalist>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/cabinets")}
            className="px-5 py-2 border border-slate-400 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50"
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

      <ConfirmationModal
        open={modalOpen}
        categoryName={category}
        onConfirm={() => createCabinetFlow()}
        onCancel={() => setModalOpen(false)}
      />
    </Layout>
  );
}