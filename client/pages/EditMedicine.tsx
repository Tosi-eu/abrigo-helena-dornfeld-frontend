import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";
import {
  validateTextInput,
  validateNumberInput,
  sanitizeInput,
} from "@/helpers/validation.helper";

import { updateMedicine } from "@/api/requests";

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

export default function EditMedicine() {
  const location = useLocation();
  const navigate = useNavigate();

  const [medicineId, setMedicineId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    principio_ativo: "",
    dosagem: "",
    unidade_medida: "" as string | null,
    estoque_minimo: 0,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state?.item) {
      const item = location.state.item;
      setMedicineId(item.id);

      setFormData({
        nome: item.nome || "",
        principio_ativo: item.principio_ativo || "",
        dosagem: item.dosagem || "",
        unidade_medida: item.unidade_medida || null,
        estoque_minimo: item.estoque_minimo || 0,
      });
    }
  }, [location.state]);

  const handleChange = (field: string, value: any) => {
    const sanitized = typeof value === "string" ? sanitizeInput(value) : value;
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicineId) {
      toast({
        title: "Erro",
        description: "Medicamento não identificado.",
        variant: "error",
      });
      return;
    }

    const nameValidation = validateTextInput(formData.nome, {
      maxLength: 100,
      required: true,
      fieldName: "Nome do medicamento",
    });

    if (!nameValidation.valid) {
      toast({
        title: "Erro de validação",
        description: nameValidation.error,
        variant: "error",
      });
      return;
    }

    const activePrincipleValidation = validateTextInput(formData.principio_ativo, {
      maxLength: 100,
      required: true,
      fieldName: "Princípio ativo",
    });

    if (!activePrincipleValidation.valid) {
      toast({
        title: "Erro de validação",
        description: activePrincipleValidation.error,
        variant: "error",
      });
      return;
    }

    const dosageValidation = validateTextInput(formData.dosagem, {
      maxLength: 30,
      required: true,
      fieldName: "Dosagem",
    });

    if (!dosageValidation.valid) {
      toast({
        title: "Erro de validação",
        description: dosageValidation.error,
        variant: "error",
      });
      return;
    }

    const minValidation = validateNumberInput(formData.estoque_minimo, {
      min: 0,
      max: 999999,
      required: false,
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
      await updateMedicine(medicineId, {
        nome: nameValidation.sanitized!,
        principio_ativo: activePrincipleValidation.sanitized!,
        dosagem: dosageValidation.sanitized!,
        unidade_medida: formData.unidade_medida || null,
        estoque_minimo: minValidation.value || 0,
      });

      toast({
        title: "Medicamento atualizado",
        description: `${nameValidation.sanitized} foi atualizado com sucesso.`,
        variant: "success",
      });

      navigate("/medicines");
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Erro inesperado ao salvar alterações.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Edição de Medicamento">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Editar Medicamento
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Nome do medicamento</Label>
              <Input
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                maxLength={100}
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Princípio ativo</Label>
              <Input
                value={formData.principio_ativo}
                onChange={(e) =>
                  handleChange("principio_ativo", e.target.value)
                }
                maxLength={100}
                disabled={saving}
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label>Dosagem</Label>
                <Input
                  value={formData.dosagem}
                  onChange={(e) => handleChange("dosagem", e.target.value)}
                  maxLength={30}
                  disabled={saving}
                  required
                />
              </div>

              <div className="flex-1 space-y-1">
                <Label>Unidade de medida</Label>
                <Select
                  value={formData.unidade_medida ?? ""}
                  onValueChange={(v) => handleChange("unidade_medida", v)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="mcg">mcg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Estoque mínimo</Label>
              <Input
                type="number"
                value={formData.estoque_minimo}
                onChange={(e) =>
                  handleChange("estoque_minimo", Number(e.target.value))
                }
                disabled={saving}
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/medicines")}
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
