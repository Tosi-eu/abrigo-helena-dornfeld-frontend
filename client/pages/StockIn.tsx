import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { MedicineForm } from "@/components/MedicineForm";
import { InputForm } from "@/components/InputForm";
import { toast } from "@/hooks/use-toast.hook";
import { getErrorMessage } from "@/helpers/validation.helper";
import { useFormWithZod } from "@/hooks/use-form-with-zod";
import { stockInSchema, type StockInFormData } from "@/schemas/stock-in.schema";
import {
  Input,
  Medicine,
  Patient,
  Cabinet,
  Drawer,
} from "@/interfaces/interfaces";
import { useAuth } from "@/hooks/use-auth.hook";
import {
  createMovement,
  createStockIn,
  getCabinets,
  getDrawers,
  getInputs,
  getMedicines,
  getResidents,
} from "@/api/requests";
import { useNavigate } from "react-router-dom";
import { MovementType, OperationType } from "@/utils/enums";
import { fetchAllPaginated } from "@/helpers/paginacao.helper";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function StockIn() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormWithZod(stockInSchema, {
    defaultValues: {
      operationType: undefined,
    },
  });

  const operationType = watch("operationType");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [caselas, setCaselas] = useState<Patient[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [medicines, inputs, residents, cabinets, drawers] =
          await Promise.all([
            fetchAllPaginated(getMedicines),
            fetchAllPaginated(getInputs),
            fetchAllPaginated(getResidents),
            fetchAllPaginated(getCabinets),
            fetchAllPaginated(getDrawers),
          ]);

        setMedicines(medicines as Medicine[]);
        setInputs(inputs as Input[]);
        setCaselas(residents as Patient[]);
        setCabinets(cabinets as Cabinet[]);
        setDrawers(drawers as Drawer[]);
      } catch (err: unknown) {
        toast({
          title: "Erro ao carregar dados",
          description: getErrorMessage(
            err,
            "Não foi possível carregar os dados.",
          ),
          variant: "error",
        duration: 3000,
        });
        setMedicines([]);
        setInputs([]);
        setCaselas([]);
        setCabinets([]);
      }
    };

    fetchAll();
  }, []);

  const handleMedicineSubmit = async (data) => {
    try {
      const payload = {
        tipo: data.stockType,
        medicamento_id: data.id,
        quantidade: data.quantity,
        armario_id: data.cabinetId ?? null,
        gaveta_id: data.drawerId ?? null,
        casela_id: data.casela ?? null,
        validade: data.expirationDate ?? null,
        origem: data.origin ?? null,
        setor: data.sector,
        lote: data.lot ?? null,
        observacao: data.observacao ?? null,
        preco: data.preco ? Number(data.preco) : null,
      };

      const response = await createStockIn(payload);

      console.log(response);

      if (response?.data?.priceSearchResult?.found) {
        const priceResult = response.data.priceSearchResult;
          const precoTotal = priceResult.price * data.quantity;
          toast({
            title: "Preço encontrado automaticamente!",
            description: `Preço unitário: R$ ${priceResult.price.toFixed(2).replace(".", ",")}. Total: R$ ${precoTotal.toFixed(2).replace(".", ",")} (${priceResult.price.toFixed(2).replace(".", ",")} × ${data.quantity}). Verifique e edite se necessário.`,
            variant: "success",
            duration: 5000,
          });
        } else {
          toast({
            title: "Preço não encontrado",
            description: "Não foi possível encontrar o preço automaticamente. Edite o item de estoque para adicionar o preço manualmente.",
            variant: "warning",
            duration: 5000,
          });
        }

      await createMovement({
        tipo: MovementType.IN,
        login_id: user?.id,
        armario_id: data.cabinetId ?? null,
        quantidade: data.quantity,
        casela_id: data.casela ?? null,
        gaveta_id: data.drawerId ?? null,
        medicamento_id: data.id,
        validade: data.expirationDate,
        setor: data.sector,
        lote: data.lot ?? null,
      });

      toast({
        title: "Entrada registrada com sucesso!",
        description: "Medicamento adicionado ao estoque.",
        variant: "success",
        duration: 3000,
      });

      navigate("/stock");
    } catch (err: unknown) {
      toast({
        title: "Erro ao registrar",
        description: getErrorMessage(
          err,
          "Não foi possível registrar a entrada.",
        ),
        variant: "error",
        duration: 3000,
      });
    }
  };

  const handleInputSubmit = async (data) => {
    try {
      const payload = {
        tipo: data.stockType,
        insumo_id: data.inputId,
        quantidade: data.quantity,
        armario_id: data.cabinetId ?? null,
        gaveta_id: data.drawerId ?? null,
        casela_id: data.casela ?? null,
        validade: data.validity,
        setor: data.sector,
        lote: data.lot ?? null,
        preco: data.preco ? Number(data.preco) * data.quantity : null,
      };

      const response = await createStockIn(payload);

      // Mostrar toast sobre busca de preço se o preço não foi informado
      if (!data.preco && response?.data?.priceSearchResult) {
        const priceResult = response.data.priceSearchResult;
        if (priceResult.found && priceResult.price) {
          const precoTotal = priceResult.price * data.quantity;
          toast({
            title: "Preço encontrado automaticamente!",
            description: `Preço unitário: R$ ${priceResult.price.toFixed(2).replace(".", ",")}. Total: R$ ${precoTotal.toFixed(2).replace(".", ",")} (${priceResult.price.toFixed(2).replace(".", ",")} × ${data.quantity}). Verifique e edite se necessário.`,
            variant: "success",
            duration: 5000,
          });
        } else {
          toast({
            title: "Preço não encontrado",
            description: "Não foi possível encontrar o preço automaticamente. Edite o item de estoque para adicionar o preço manualmente.",
            variant: "warning",
            duration: 5000,
          });
        }
      }

      await createMovement({
        tipo: MovementType.IN,
        login_id: user?.id!,
        insumo_id: data.inputId,
        armario_id: data.cabinetId ?? null,
        gaveta_id: data.drawerId ?? null,
        casela_id: data.casela ?? null,
        quantidade: data.quantity,
        validade: data.validity,
        setor: data.sector,
        lote: data.lot ?? null,
      });

      toast({
        title: "Entrada registrada!",
        description: "Insumo adicionado ao estoque.",
        variant: "success",
        duration: 3000,
      });

      navigate("/stock");
    } catch (err: unknown) {
      toast({
        title: "Erro ao registrar entrada",
        description: getErrorMessage(
          err,
          "Não foi possível registrar a entrada.",
        ),
        variant: "error",
        duration: 3000,
      });
    }
  };

  const canonicalMedicines: Medicine[] = medicines.map((m: any) => ({
    id: m.id,
    name: m.nome,
    dosage: m.dosagem,
    measurementUnit: m.unidade_medida,
    substance: m.principio_ativo,
    minimumStock: m.estoque_minimo,
  }));

  const canonicalInputs: Input[] = inputs.map((i: any) => ({
    id: i.id,
    name: i.nome,
    description: i.descricao,
    minimumStock: i.estoque_minimo,
  }));

  return (
    <Layout title="Entrada de Estoque">
      <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Registrar Entrada
        </h2>

        <div className="space-y-1">
          <Label htmlFor="operationType">Tipo de entrada</Label>
          <Controller
            name="operationType"
            control={control}
            render={({ field }) => (
              <>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white" id="operationType">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OperationType.MEDICINE}>
                      {OperationType.MEDICINE}
                    </SelectItem>
                    <SelectItem value={OperationType.INPUT}>
                      {OperationType.INPUT}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.operationType && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.operationType.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {operationType === OperationType.MEDICINE && (
          <MedicineForm
            medicines={canonicalMedicines}
            caselas={caselas}
            cabinets={cabinets}
            drawers={drawers}
            onSubmit={handleMedicineSubmit}
          />
        )}

        {operationType === OperationType.INPUT && (
          <InputForm
            inputs={canonicalInputs}
            caselas={caselas}
            cabinets={cabinets}
            drawers={drawers}
            onSubmit={handleInputSubmit}
          />
        )}
      </div>
    </Layout>
  );
}
