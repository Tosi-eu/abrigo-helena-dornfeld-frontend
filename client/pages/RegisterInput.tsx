import { useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";
import {
  validateTextInput,
  validateNumberInput,
  sanitizeInput,
} from "@/helpers/validation.helper";

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

    const nameValidation = validateTextInput(formData.name, {
      maxLength: 255,
      required: true,
      fieldName: "Nome do insumo",
    });

    if (!nameValidation.valid) {
      toast({
        title: "Erro de validação",
        description: nameValidation.error,
        variant: "error",
      });
      return;
    }

    const descValidation = validateTextInput(formData.description, {
      maxLength: 1000,
      required: true,
      fieldName: "Descrição",
    });

    if (!descValidation.valid) {
      toast({
        title: "Erro de validação",
        description: descValidation.error,
        variant: "error",
      });
      return;
    }

    const minValidation = validateNumberInput(formData.minimum || "0", {
      min: 0,
      max: 999999,
      fieldName: "Estoque mínimo",
    });

    if (!minValidation.valid) {
      toast({
        title: "Erro de validação",
        description: minValidation.error,
        variant: "error",
      });
      return;
    }

    setSaving(true);

    try {
      await createInput(
        nameValidation.sanitized!,
        descValidation.sanitized!,
        minValidation.value || 0,
      );

      toast({
        title: "Insumo cadastrado",
        description: `${nameValidation.sanitized} foi adicionado ao sistema.`,
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
                  setFormData({
                    ...formData,
                    name: sanitizeInput(e.target.value),
                  })
                }
                maxLength={255}
                placeholder="Seringa 5ml"
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: sanitizeInput(e.target.value),
                  })
                }
                maxLength={1000}
                placeholder="Material de Injeção"
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Estoque mínimo</Label>
              <Input
                type="number"
                value={formData.minimum}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                min={0}
                max={999999}
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
