import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";
import {
  validateTextInput,
  validateNumberInput,
  sanitizeInput,
} from "@/helpers/validation.helper";
import { createMedicine, getMedicines } from "@/api/requests";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { sanitizeDosage } from "@/helpers/medicacao.helper";

export default function SignUpMedicine() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    substance: "",
    dosageValue: "",
    measurementUnit: "",
    minimumStock: "",
  });

  const [medicines, setMedicines] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const data = await getMedicines();
        setMedicines(data.data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os medicamentos.",
          variant: "error",
        });
      }
    }

    fetchMedicines();
  }, []);

  const handleMedicineSelect = (value: string) => {
    if (value.trim() === "") {
      setFormData({
        name: "",
        substance: "",
        dosageValue: "",
        measurementUnit: "",
        minimumStock: "",
      });
      return;
    }

    const selected = medicines.find((m) => m.name === value);
    if (selected) {
      const match = selected.dosagem?.match(/^(\d+(?:,\d+)?)([a-zA-Z]+)$/);
      const dosageValue = match ? match[1] : "";
      const measurementUnit = match ? match[2] : "";

      setFormData({
        name: selected.name,
        substance: selected.principio_ativo || "",
        dosageValue,
        measurementUnit,
        minimumStock: selected.estoque_minimo?.toString() || "",
      });
    } else {
      setFormData({ ...formData, name: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameValidation = validateTextInput(formData.name, {
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

    const substanceValidation = validateTextInput(formData.substance, {
      maxLength: 100,
      required: true,
      fieldName: "Princípio ativo",
    });

    if (!substanceValidation.valid) {
      toast({
        title: "Erro de validação",
        description: substanceValidation.error,
        variant: "error",
      });
      return;
    }

    const dosageValidation = validateTextInput(formData.dosageValue, {
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

    if (!formData.measurementUnit) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione a unidade de medida.",
        variant: "error",
      });
      return;
    }

    const minStockValidation = validateNumberInput(formData.minimumStock, {
      min: 0,
      max: 999999,
      required: false,
      fieldName: "Estoque mínimo",
    });

    if (!minStockValidation.valid) {
      toast({
        title: "Erro de validação",
        description: minStockValidation.error,
        variant: "error",
      });
      return;
    }

    setSaving(true);

    try {
      await createMedicine(
        nameValidation.sanitized!,
        substanceValidation.sanitized!,
        dosageValidation.sanitized!,
        formData.measurementUnit,
        minStockValidation.value ?? null,
      );

      toast({
        title: "Medicamento cadastrado!",
        description: `${nameValidation.sanitized} (${dosageValidation.sanitized}${formData.measurementUnit}) foi registrado com sucesso.`,
        variant: "success",
      });

      navigate("/medicines");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao cadastrar",
        description:
          error?.message || "Não foi possível registrar o medicamento.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Cadastro de Medicamento">
      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Cadastro de Medicamento
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Nome do medicamento</Label>
              <Input
                list="lista-medicamentos"
                value={formData.name}
                onChange={(e) => handleMedicineSelect(sanitizeInput(e.target.value))}
                maxLength={255}
                placeholder="Digite o nome do medicamento"
                disabled={saving}
                required
              />
              <datalist id="lista-medicamentos">
                {medicines.map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <Label>Princípio ativo</Label>
              <Input
                value={formData.substance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    substance: sanitizeInput(e.target.value),
                  })
                }
                maxLength={255}
                required
                placeholder="Paracetamol"
                disabled={saving}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <Label>Dosagem</Label>
                <Input
                  value={formData.dosageValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dosageValue: sanitizeInput(sanitizeDosage(e.target.value)),
                    })
                  }
                  maxLength={50}
                  required
                  placeholder="10,5 ou 10/100"
                  disabled={saving}
                />
              </div>

              <div className="flex-1 space-y-1">
                <Label>Unidade</Label>
                <Select
                  value={formData.measurementUnit}
                  onValueChange={(v) =>
                    setFormData({ ...formData, measurementUnit: v })
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="mcg">mcg</SelectItem>
                    <SelectItem value="mg/ml">mg/ml</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Estoque mínimo</Label>
              <Input
                value={formData.minimumStock}
                onChange={(e) =>
                  setFormData({ ...formData, minimumStock: e.target.value })
                }
                placeholder="10"
                disabled={saving}
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                variant="outline"
                type="button"
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
                {saving ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
