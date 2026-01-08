import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast.hook";
import {
  validateNumberInput,
  sanitizeInput,
} from "@/helpers/validation.helper";
import { updateStockItem, getCabinets, getDrawers, getResidents } from "@/api/requests";
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
import { StockItem } from "@/interfaces/interfaces";
import { Cabinet, Drawer, Patient } from "@/interfaces/interfaces";
import { SectorType, OriginType, MedicineStockType, InputStockType, StockTypeLabels } from "@/utils/enums";
import { fetchAllPaginated } from "@/helpers/paginacao.helper";
import ConfirmActionModal from "@/components/ConfirmationActionModal";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { parseDateFromString } from "@/utils/utils";

// Cache for cabinets, drawers, and residents
const cache = {
  cabinets: null as Cabinet[] | null,
  drawers: null as Drawer[] | null,
  residents: null as Patient[] | null,
  timestamp: 0,
  TTL: 5 * 60 * 1000, // 5 minutes
};

const getCachedData = async () => {
  const now = Date.now();
  
  if (cache.cabinets && cache.drawers && cache.residents && (now - cache.timestamp) < cache.TTL) {
    return {
      cabinets: cache.cabinets,
      drawers: cache.drawers,
      residents: cache.residents,
    };
  }

  const [cabinets, drawers, residents] = await Promise.all([
    fetchAllPaginated(getCabinets),
    fetchAllPaginated(getDrawers),
    fetchAllPaginated(getResidents),
  ]);

  cache.cabinets = cabinets as unknown as Cabinet[];
  cache.drawers = drawers as unknown as Drawer[];
  cache.residents = residents as unknown as Patient[];
  cache.timestamp = now;

  return {
    cabinets: cache.cabinets,
    drawers: cache.drawers,
    residents: cache.residents,
  };
};

export default function EditStock() {
  const location = useLocation();
  const navigate = useNavigate();

  const [stockItem, setStockItem] = useState<StockItem | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [residents, setResidents] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    quantidade: 0,
    armario_id: null as number | null,
    gaveta_id: null as number | null,
    validade: null as Date | null,
    origem: "" as OriginType | "",
    setor: "" as SectorType | "",
    lote: "",
    casela_id: null as number | null,
    tipo: "" as string,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (location.state?.item) {
          const item = location.state.item as StockItem;
          setStockItem(item);

          let validadeDate: Date | null = null;
          if (item.expiry && item.expiry !== "-") {
            if (item.expiry.includes("/")) {
              validadeDate = parseDateFromString(item.expiry);
            } else {
              const parsed = new Date(item.expiry);
              validadeDate = isNaN(parsed.getTime()) ? null : parsed;
            }
          }

          let rawTipo = item.tipo || "";
          if (!rawTipo && item.stockType) {
            const tipoMap: Record<string, string> = {
              "Estoque geral": "geral",
              "Estoque individual": "individual",
              "Carrinho de emergência": "carrinho_emergencia",
            };
            rawTipo = tipoMap[item.stockType] || "";
          }

          setFormData({
            quantidade: item.quantity || 0,
            armario_id: typeof item.cabinet === "number" ? item.cabinet : null,
            gaveta_id: typeof item.drawer === "number" ? item.drawer : null,
            validade: validadeDate,
            origem: (item.origin as OriginType) || OriginType.FAMILIA,
            setor: (item.sector as SectorType) || SectorType.FARMACIA,
            lote: item.lot || "",
            casela_id: typeof item.casela === "number" ? item.casela : null,
            tipo: rawTipo || (isMedicine ? MedicineStockType.GERAL : InputStockType.GERAL),
          });

          const cached = await getCachedData();
          setCabinets(cached.cabinets);
          setDrawers(cached.drawers);
          setResidents(cached.residents);
        } else {
          toast({
            title: "Erro",
            description: "Item de estoque não encontrado.",
            variant: "error",
          });
          navigate("/stock");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados";
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "error",
        });
        navigate("/stock");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.state, navigate]);

  const handleChange = (field: string, value: string | number | Date | null) => {
    setFormData((prev) => {
      const updated = { ...prev };
      
      if (field === "armario_id") {
        updated.armario_id = value as number | null;
        if (value !== null) {
          updated.gaveta_id = null;
        } else {
          updated.casela_id = null;
        }
      } else if (field === "gaveta_id") {
        updated.gaveta_id = value as number | null;
        if (value !== null) {
          updated.armario_id = null;
          updated.setor = SectorType.ENFERMAGEM;
          updated.tipo = isMedicine ? MedicineStockType.CARRINHO : InputStockType.CARRINHO;
          updated.casela_id = null;
        }
      } else if (field === "casela_id") {
        updated.casela_id = value as number | null;
        if (value !== null && isMedicine) {
          updated.tipo = MedicineStockType.INDIVIDUAL;
        }
      } else if (field === "quantidade") {
        updated.quantidade = value as number;
      } else if (field === "validade") {
        updated.validade = value as Date | null;
      } else if (field === "origem") {
        updated.origem = (value as OriginType | "") || "";
      } else if (field === "setor") {
        updated.setor = value as SectorType | "";
      } else if (field === "lote") {
        const sanitized = typeof value === "string" ? sanitizeInput(value) : "";
        updated.lote = sanitized;
      } else if (field === "tipo") {
        updated.tipo = typeof value === "string" ? value : "";
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!stockItem) return;

    const quantityValidation = validateNumberInput(formData.quantidade, {
      min: 0,
      max: 999999,
      required: true,
      fieldName: "Quantidade",
    });

    if (!quantityValidation.valid) {
      toast({
        title: "Erro de validação",
        description: quantityValidation.error,
        variant: "error",
      });
      setConfirmOpen(false);
      return;
    }

    if (!formData.setor) {
      toast({
        title: "Erro de validação",
        description: "Setor é obrigatório",
        variant: "error",
      });
      setConfirmOpen(false);
      return;
    }

    if (!formData.tipo) {
      toast({
        title: "Erro de validação",
        description: "Tipo é obrigatório",
        variant: "error",
      });
      setConfirmOpen(false);
      return;
    }

    setSaving(true);
    setConfirmOpen(false);

    try {
      await updateStockItem(
        stockItem.id,
        stockItem.itemType === "medicamento" ? "medicamento" : "insumo",
        {
          quantidade: quantityValidation.value!,
          armario_id: formData.armario_id,
          gaveta_id: formData.gaveta_id,
          validade: formData.validade ? formData.validade.toISOString().split("T")[0] : null,
          origem: formData.origem || undefined,
          setor: formData.setor,
          lote: formData.lote || null,
          casela_id: formData.casela_id,
          tipo: formData.tipo,
        },
      );

      toast({
        title: "Item atualizado",
        description: "O item de estoque foi atualizado com sucesso.",
        variant: "success",
      });

      navigate("/stock");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar item de estoque";
      toast({
        title: "Erro ao atualizar",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Editar Estoque">
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!stockItem) {
    return null;
  }

  const isMedicine = stockItem.itemType === "medicamento";
  
  const availableStockTypes = isMedicine
    ? Object.values(MedicineStockType)
    : Object.values(InputStockType);

  return (
    <Layout title="Editar Item de Estoque">
      <Card className="max-w-2xl mx-auto mt-10 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Editar Item de Estoque
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            {stockItem.name} {isMedicine && stockItem.activeSubstance && `- ${stockItem.activeSubstance}`}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    handleChange("quantidade", 0);
                    return;
                  }
                  if (value === "-" || value.startsWith("-")) {
                    return;
                  }
                  const numValue = Number(value);
                  if (!isNaN(numValue) && numValue > 0) {
                    handleChange("quantidade", numValue);
                  } else if (numValue === 0) {
                    return;
                  }
                }}
                min={1}
                max={999999}
                disabled={saving}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Armário</Label>
                <Select
                  value={formData.armario_id?.toString() ?? "none"}
                  onValueChange={(v) =>
                    handleChange("armario_id", v === "none" ? null : Number(v))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {cabinets.map((cabinet) => (
                      <SelectItem key={cabinet.numero} value={cabinet.numero.toString()}>
                        Armário {cabinet.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Gaveta</Label>
                <Select
                  value={formData.gaveta_id?.toString() ?? "none"}
                  onValueChange={(v) =>
                    handleChange("gaveta_id", v === "none" ? null : Number(v))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {drawers.map((drawer) => (
                      <SelectItem key={drawer.numero} value={drawer.numero.toString()}>
                        Gaveta {drawer.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Casela</Label>
                <select
                  value={formData.casela_id?.toString() ?? ""}
                  onChange={(e) =>
                    handleChange("casela_id", e.target.value ? Number(e.target.value) : null)
                  }
                  disabled={formData.gaveta_id !== null || formData.armario_id === null}
                  className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm ${
                    formData.gaveta_id !== null || formData.armario_id === null
                      ? "bg-slate-100 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  <option value="">Nenhuma</option>
                  {residents.map((resident) => (
                    <option key={resident.casela} value={resident.casela}>
                      {resident.casela}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Residente</Label>
                <input
                  type="text"
                  value={
                    formData.casela_id
                      ? residents.find((r) => r.casela === formData.casela_id)?.name || ""
                      : ""
                  }
                  readOnly
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Validade:</Label>
              <DatePicker
                selected={formData.validade}
                onChange={(date: Date | null) => handleChange("validade", date)}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                placeholderText="Selecione a data"
                className="w-full border rounded-lg p-2"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Origem</Label>
                <Select
                  value={formData.origem || "none"}
                  onValueChange={(v) => handleChange("origem", v === "none" ? "" : (v as OriginType))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {Object.values(OriginType).map((origin) => (
                      <SelectItem key={origin} value={origin}>
                        {origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => handleChange("tipo", v)}
                  required
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStockTypes.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {StockTypeLabels[tipo as keyof typeof StockTypeLabels] || tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Setor</Label>
                <Select
                  value={formData.setor}
                  onValueChange={(v) => handleChange("setor", v as SectorType)}
                  required
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SectorType).map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector === SectorType.FARMACIA ? "Farmácia" : "Enfermagem"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Lote</Label>
                <Input
                  value={formData.lote}
                  onChange={(e) => handleChange("lote", e.target.value)}
                  maxLength={50}
                  disabled={saving}
                  placeholder="Número do lote"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/stock")}
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

      <ConfirmActionModal
        open={confirmOpen}
        title="Confirmar Edição de Estoque"
        description="Tem certeza que deseja editar este item de estoque? Esta ação não pode ser desfeita."
        confirmLabel="Confirmar Edição"
        cancelLabel="Cancelar"
        loading={saving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Layout>
  );
}

