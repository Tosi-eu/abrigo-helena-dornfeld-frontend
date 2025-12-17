import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { MedicineForm } from "@/components/MedicineForm";
import { InputForm } from "@/components/InputForm";
import { toast } from "@/hooks/use-toast.hook";
import { Input, Medicine, Patient, Cabinet } from "@/interfaces/interfaces";
import { useAuth } from "@/hooks/use-auth.hook";
import {
  createMovement,
  createStockIn,
  getCabinets,
  getInputs,
  getMedicines,
  getResidents,
} from "@/api/requests";
import { useNavigate } from "react-router-dom";
import { MovementType, OperationType } from "@/utils/enums";
import { fetchAllPaginated } from "@/helpers/pagination.helper";

export default function StockIn() {
  const [operationType, setOperationType] = useState<
    OperationType | "Selecione"
  >("Selecione");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [caselas, setCaselas] = useState<Patient[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const [medicines, inputs, residents, cabinets] = await Promise.all([
          fetchAllPaginated(getMedicines),
          fetchAllPaginated(getInputs),
          fetchAllPaginated(getResidents),
          fetchAllPaginated(getCabinets),
        ]);

        console.log(cabinets);

        setMedicines(medicines as Medicine[]);
        setInputs(inputs as Input[]);
        setCaselas(residents as Patient[]);
        setCabinets(cabinets as Cabinet[]);
      } catch (err) {
        console.error("Erro ao carregar dados da tela de entrada:", err);
        setMedicines([]);
        setInputs([]);
        setCaselas([]);
        setCabinets([]);
      } finally {
        setLoading(false);
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
        armario_id: data.cabinet,
        casela_id: data.casela ?? null,
        validade: data.expirationDate ?? null,
        origem: data.origin ?? null,
      };

      await createStockIn(payload);

      await createMovement({
        tipo: MovementType.IN,
        login_id: user?.id!,
        medicamento_id: data.id,
        armario_id: data.cabinet,
        casela_id: data.casela ?? null,
        quantidade: data.quantity,
        validade: data.expirationDate ?? null,
      });

      toast({
        title: "Entrada registrada com sucesso!",
        description: "Medicamento adicionado ao estoque.",
        variant: "success",
      });

      navigate("/stock");
    } catch (err: any) {
      toast({
        title: "Erro ao registrar",
        description: err.message,
        variant: "error",
      });
    }
  };

  const handleInputSubmit = async (data) => {
    try {
      const payload = {
        tipo: data.stockType,
        insumo_id: data.inputId,
        quantidade: data.quantity,
        armario_id: data.cabinetId,
        validade: data.validity,
      };

      await createStockIn(payload);

      await createMovement({
        tipo: MovementType.IN,
        login_id: user?.id!,
        insumo_id: data.inputId,
        armario_id: data.cabinetId,
        quantidade: data.quantity,
        validade: data.validity,
      });

      toast({
        title: "Entrada registrada!",
        description: "Insumo adicionado ao estoque.",
        variant: "success",
      });

      navigate("/stock");
    } catch (err: any) {
      toast({
        title: "Erro ao registrar entrada",
        description: err.message,
        variant: "error",
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
      {!loading && (
        <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Registrar Entrada
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de entrada
            </label>
            <select
              value={operationType === "Selecione" ? "" : operationType}
              onChange={(e) =>
                setOperationType(e.target.value as OperationType)
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 hover:border-slate-400"
            >
              <option value="" disabled hidden>
                Selecione
              </option>

              <option value={OperationType.MEDICINE}>
                {OperationType.MEDICINE}
              </option>
              <option value={OperationType.INPUT}>{OperationType.INPUT}</option>
            </select>
          </div>

          {operationType === OperationType.MEDICINE && (
            <MedicineForm
              medicines={canonicalMedicines}
              caselas={caselas}
              cabinets={cabinets}
              onSubmit={handleMedicineSubmit}
            />
          )}

          {operationType === OperationType.INPUT && (
            <InputForm
              inputs={canonicalInputs}
              cabinets={cabinets}
              onSubmit={handleInputSubmit}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
