import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";

import { updateInput } from "@/api/requests";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditInput() {
  const location = useLocation();
  const navigate = useNavigate();

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
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o insumo.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Edição de Insumo">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Editar Insumo
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Nome do insumo</Label>
              <Input
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Ex: Seringa 5ml"
                disabled={saving}
              />
            </div>

            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                placeholder="Ex: Material de injeção"
                disabled={saving}
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/inputs")}
                disabled={saving}
                className="rounded-lg"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
