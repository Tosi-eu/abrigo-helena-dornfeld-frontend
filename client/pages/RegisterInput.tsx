import { useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";

import { createInput } from "@/api/requests";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterInput() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minimum: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para cadastrar o Insumo.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await createInput(
        formData.name,
        formData.description,
        parseInt(formData.minimum || "0", 10),
      );

      toast({
        title: "Insumo cadastrado",
        description: `${formData.name} foi adicionado ao sistema.`,
        variant: "success",
      });

      setFormData({ name: "", description: "", minimum: "" });
      navigate("/inputs");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao cadastrar insumo",
        description: "Não foi possível salvar o insumo no banco.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Cadastro de Insumo">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Cadastro de Insumo
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Nome do insumo</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Seringa 5ml"
                disabled={saving}
              />
            </div>

            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Material de Injeção"
                disabled={saving}
              />
            </div>

            <div className="space-y-1">
              <Label>Estoque mínimo</Label>
              <Input
                type="number"
                value={formData.minimum}
                onChange={(e) =>
                  setFormData({ ...formData, minimum: e.target.value })
                }
                placeholder="5"
                disabled={saving}
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                variant="outline"
                type="button"
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
                {saving ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
