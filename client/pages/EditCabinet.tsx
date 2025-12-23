import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";

import {
  getCabinets,
  updateCabinet,
  getCabinetCategories,
} from "@/api/requests";
import { Cabinet } from "@/interfaces/interfaces";

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

export default function EditCabinet() {
  const location = useLocation();
  const navigate = useNavigate();

  const item = location.state?.item as Cabinet | undefined;

  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [categories, setCategories] = useState<{ id: number; nome: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    categoryId: 0,
  });

  useEffect(() => {
    getCabinets()
      .then((res) => setCabinets(res.data))
      .catch(() =>
        toast({
          title: "Erro ao carregar armários",
          description: "Não foi possível buscar os armários do servidor.",
          variant: "error",
        }),
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
        }),
      );
  }, []);

  useEffect(() => {
    if (item && cabinets.length > 0 && categories.length > 0) {
      const cab = cabinets.find((c) => c.numero === item.numero);

      if (cab) {
        const matchedCategory = categories.find(
          (c) => c.nome === cab.categoria,
        );

        setFormData({
          id: cab.numero,
          categoryId: matchedCategory?.id ?? 0,
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Editar Armário
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <div className="space-y-1">
              <Label>Armário</Label>

              <Select
                value={formData.id ? String(formData.id) : ""}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o armário" />
                </SelectTrigger>

                <SelectContent>
                  {cabinets.map((c) => (
                    <SelectItem key={c.numero} value={String(c.numero)}>
                      Armário {c.numero} ({c.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.id !== 0 && (
              <>
                <div className="space-y-1">
                  <Label>Número do armário</Label>
                  <Input
                    className="bg-slate-100 text-slate-500"
                    type="number"
                    value={formData.id}
                    onChange={(e) => handleChange("id", Number(e.target.value))}
                    disabled={loading}
                    readOnly
                  />
                </div>

                <div className="space-y-1">
                  <Label>Categoria</Label>

                  <Select
                    value={String(formData.categoryId)}
                    onValueChange={(v) => handleChange("categoryId", Number(v))}
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
                    onClick={() => navigate("/cabinets")}
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
