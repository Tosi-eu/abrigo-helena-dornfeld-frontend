import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast.hook";
import {
  validateTextInput,
  sanitizeInput,
} from "@/helpers/validation.helper";

import { updateResident } from "@/api/requests";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditResident() {
  const location = useLocation();
  const item = location.state?.item;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    num_casela: "",
    nome: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        num_casela: item.casela?.toString() || "",
        nome: item.name || "",
      });
    } else {
      toast({
        title: "Nenhum residente selecionado",
        description: "Volte à lista e escolha um residente para editar.",
        variant: "warning",
      });
      navigate("/residents");
    }
  }, [item, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
  };

  const handleSave = async () => {
    if (!formData.num_casela) {
      toast({
        title: "Erro",
        description: "Casela não identificada.",
        variant: "error",
      });
      return;
    }

    const nameValidation = validateTextInput(formData.nome, {
      maxLength: 100,
      required: true,
      fieldName: "Nome do residente",
    });

    if (!nameValidation.valid) {
      toast({
        title: "Erro de validação",
        description: nameValidation.error,
        variant: "error",
      });
      return;
    }

    setSaving(true);

    try {
      const updated = await updateResident(formData.num_casela, {
        nome: nameValidation.sanitized!,
      });

      toast({
        title: "Residente atualizado",
        description: `O residente ${updated.name} foi atualizado com sucesso!`,
        variant: "success",
      });

      navigate("/residents");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao editar residente",
        description: err.message || "Não foi possível atualizar o residente.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Editar Residente">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Edição de Residente
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                maxLength={100}
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Casela</Label>
              <Input
                name="num_casela"
                value={formData.num_casela}
                disabled
                className="bg-slate-100 text-slate-500"
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/residents")}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
