import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import LoadingModal from "@/components/LoadingModal";
import {
  createCabinet,
  createCabinetCategory,
  getCabinetCategories,
} from "@/api/requests";
import { CabinetCategory } from "@/interfaces/interfaces";
import ConfirmationModal from "@/components/ConfirmationModal";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterCabinet() {
  const [id, setId] = useState<number>(0);
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState<CabinetCategory[]>([]);
  const [page, setPage] = useState(1);

  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

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

      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 text-center">
            Cadastro de Armário
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Número do Armário</Label>
              <Input
                type="number"
                value={id}
                onChange={(e) =>
                  setId(e.target.value === "0" ? 0 : parseInt(e.target.value))
                }
                placeholder="Ex: 4"
                disabled={saving}
              />
            </div>

            <div className="space-y-1">
              <Label>Categoria</Label>
              <Input
                list="categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Selecione ou digite uma categoria"
                disabled={saving}
              />
              <datalist id="categories">
                {categories.map((c) => (
                  <option key={c.id} value={c.nome} />
                ))}
              </datalist>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cabinets")}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {saving ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={modalOpen}
        categoryName={category}
        onConfirm={() => createCabinetFlow()}
        onCancel={() => setModalOpen(false)}
      />
    </Layout>
  );
}
