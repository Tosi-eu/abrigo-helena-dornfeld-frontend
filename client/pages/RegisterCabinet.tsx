import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import { getErrorMessage } from "@/helpers/validation.helper";

import {
  createCabinet,
  createCabinetCategory,
  getCabinetCategories,
} from "@/api/requests";
import { CabinetCategory } from "@/interfaces/interfaces";
import { cabinetSchema, type CabinetFormData } from "@/schemas/cabinet.schema";
import ConfirmationModal from "@/components/ConfirmationModal";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterCabinet() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CabinetFormData>({
    resolver: zodResolver(cabinetSchema),
    defaultValues: {
      numero: "",
      categoria_id: "",
    },
  });

  const [categories, setCategories] = useState<CabinetCategory[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const watchedCategory = watch("categoria_id");

  useEffect(() => {
    loadCategories(page);
  }, [page]);

  const loadCategories = async (p: number) => {
    try {
      const res = await getCabinetCategories(p, 100);
      setCategories(res.data);
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description: getErrorMessage(err, "Não foi possível carregar as categorias."),
        variant: "error",
      });
    }
  };

  const onSubmit = async (data: CabinetFormData) => {
    const categoryName = data.categoria_id;
    const existing = categories.find((c) => c.nome === categoryName);

    if (!existing) {
      setModalOpen(true);
      return;
    }

    await createCabinetFlow(Number(data.numero), existing.id);
  };

  const createCabinetFlow = async (numero: number, categoryId?: number) => {
    try {
      let finalCategoryId: number;
      const categoryName = watchedCategory;

      if (categoryId) {
        finalCategoryId = categoryId;
      } else {
        const createRes = await createCabinetCategory(categoryName);
        finalCategoryId = createRes?.id;
      }

      await createCabinet(numero, finalCategoryId);

      toast({
        title: "Armário criado",
        description: `O armário ${numero} foi cadastrado com sucesso.`,
        variant: "success",
      });

      navigate("/cabinets");
    } catch (err: unknown) {
      toast({
        title: "Erro ao cadastrar",
        description: getErrorMessage(err, "Não foi possível cadastrar o armário."),
        variant: "error",
      });
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <Layout title="Cadastrar Armário">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 text-center">
            Cadastro de Armário
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="numero">Número do Armário</Label>
              <Input
                id="numero"
                type="number"
                {...register("numero")}
                placeholder="Ex: 4"
                disabled={isSubmitting}
                aria-invalid={errors.numero ? "true" : "false"}
              />
              {errors.numero && (
                <p className="text-sm text-red-600 mt-1">{errors.numero.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="categoria_id">Categoria</Label>
              <Input
                id="categoria_id"
                list="categories"
                {...register("categoria_id")}
                placeholder="Selecione ou digite uma categoria"
                disabled={isSubmitting}
                aria-invalid={errors.categoria_id ? "true" : "false"}
              />
              <datalist id="categories">
                {categories.map((c) => (
                  <option key={c.id} value={c.nome} />
                ))}
              </datalist>
              {errors.categoria_id && (
                <p className="text-sm text-red-600 mt-1">{errors.categoria_id.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cabinets")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={modalOpen}
        categoryName={watchedCategory}
        onConfirm={() => {
          const numero = watch("numero");
          createCabinetFlow(Number(numero));
        }}
        onCancel={() => setModalOpen(false)}
      />
    </Layout>
  );
}
