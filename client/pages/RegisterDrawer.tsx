import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import { getErrorMessage } from "@/helpers/validation.helper";

import {
  createDrawer,
  getDrawerCategories,
} from "@/api/requests";
import { DrawerCategory } from "@/interfaces/interfaces";
import { drawerSchema, type DrawerFormData } from "@/schemas/drawer.schema";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function RegisterDrawer() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DrawerFormData>({
    resolver: zodResolver(drawerSchema),
    defaultValues: {
      numero: "",
      categoria_id: "",
    },
  });

  const [categories, setCategories] = useState<DrawerCategory[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const watchedCategory = watch("categoria_id");

  useEffect(() => {
    loadCategories(page);
  }, [page]);

  const loadCategories = async (p: number) => {
    try {
      const res = await getDrawerCategories(p, 20);
      setCategories(res.data);
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description: getErrorMessage(err, "Não foi possível carregar as categorias de gaveta."),
        variant: "error",
        duration: 3000,
      });
    }
  };

  const onSubmit = async (data: DrawerFormData) => {
    const categoryId = Number(data.categoria_id);
    await createDrawerFlow(Number(data.numero), categoryId);
  };

  const createDrawerFlow = async (numero: number, categoryId: number) => {
    try {
      await createDrawer(numero, categoryId);

      toast({
        title: "Gaveta criada",
        description: `A gaveta ${numero} foi cadastrada com sucesso.`,
        variant: "success",
        duration: 3000,
      });

      navigate("/drawers");
    } catch (err: unknown) {
      toast({
        title: "Erro ao cadastrar",
        description: getErrorMessage(err, "Não foi possível cadastrar a gaveta."),
        variant: "error",
        duration: 3000,
      });
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <Layout title="Cadastrar Gaveta">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 text-center">
            Cadastro de Gaveta
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="numero">Número da Gaveta</Label>
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
              <Controller
                name="categoria_id"
                control={control}
                render={({ field }) => (
                  <>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="bg-white" id="categoria_id">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoria_id && (
                      <p className="text-sm text-red-600 mt-1">{errors.categoria_id.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/drawers")}
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
        categoryName={
          categories.find((c) => c.id === Number(watchedCategory))?.nome || watchedCategory
        }
        onConfirm={() => {
          const numero = watch("numero");
          const categoriaId = Number(watchedCategory);
          createDrawerFlow(Number(numero), categoriaId);
        }}
        onCancel={() => setModalOpen(false)}
      />
    </Layout>
  );
}
