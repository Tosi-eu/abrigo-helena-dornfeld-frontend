import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";

import { getDrawers, updateDrawer, getDrawerCategories } from "@/api/requests";
import { Drawer } from "@/interfaces/interfaces";

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

export default function EditDrawer() {
  const location = useLocation();
  const navigate = useNavigate();

  const item = location.state?.item as Drawer | undefined;

  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [categories, setCategories] = useState<{ id: number; nome: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    numero: 0,
    categoriaId: 0,
  });

  useEffect(() => {
    getDrawers()
      .then((res) => setDrawers(res.data))
      .catch(() =>
        toast({
          title: "Erro ao carregar gavetas",
          description: "Não foi possível buscar as gavetas do servidor.",
          variant: "error",
        }),
      );
  }, []);

  useEffect(() => {
    getDrawerCategories(1, 20)
      .then((res) => setCategories(res.data))
      .catch(() =>
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias de gavetas.",
          variant: "error",
        }),
      );
  }, []);

  useEffect(() => {
    if (item && drawers.length > 0 && categories.length > 0) {
      const dr = drawers.find((d) => d.numero === item.numero);

      if (dr) {
        const matchedCategory = categories.find((c) => c.nome === dr.categoria);

        setFormData({
          numero: dr.numero,
          categoriaId: matchedCategory?.id ?? 0,
        });
      }
    }
  }, [item, drawers, categories]);

  const handleSelectChange = (value: string) => {
    const dr = drawers.find((d) => d.numero === Number(value));

    if (!dr) {
      setFormData({ numero: 0, categoriaId: 0 });
      return;
    }

    const matchedCategory = categories.find((c) => c.nome === dr.categoria);

    setFormData({
      numero: dr.numero,
      categoriaId: matchedCategory?.id ?? 0,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.numero || !formData.categoriaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma gaveta e uma categoria.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      await updateDrawer(formData.numero, formData.categoriaId);

      toast({
        title: "Gaveta atualizada",
        description: `A gaveta ${formData.numero} foi atualizada com sucesso.`,
        variant: "success",
      });

      navigate("/drawers");
    } catch {
      toast({
        title: "Erro ao editar gaveta",
        description: "Não foi possível atualizar a gaveta.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Editar Gaveta">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Editar Gaveta
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <div className="space-y-1">
              <Label>Gaveta</Label>

              <Select
                value={formData.numero ? String(formData.numero) : ""}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione a gaveta" />
                </SelectTrigger>

                <SelectContent>
                  {drawers.map((d) => (
                    <SelectItem key={d.numero} value={String(d.numero)}>
                      Gaveta {d.numero} ({d.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.numero !== 0 && (
              <>
                <div className="space-y-1">
                  <Label>Número da gaveta</Label>
                  <Input
                    type="number"
                    value={formData.numero}
                    onChange={(e) =>
                      handleChange("numero", Number(e.target.value))
                    }
                    disabled={true}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Categoria</Label>

                  <Select
                    value={String(formData.categoriaId)}
                    onValueChange={(v) =>
                      handleChange("categoriaId", Number(v))
                    }
                  >
                    <SelectTrigger className="bg-white">
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
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/drawers")}
                    disabled={loading}
                    className="rounded-lg"
                  >
                    Cancelar
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
