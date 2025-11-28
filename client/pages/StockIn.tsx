import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { MedicineForm } from "@/components/MedicineForm";
import { InputForm } from "@/components/EquipmentForm";
import { OperationType } from "@/enums/enums";
import { toast } from "@/hooks/use-toast";
import { Input, Medicine, Patient, Cabinet } from "@/interfaces/interfaces";
import LoadingModal from "@/components/LoadingModal";
import { useAuth } from "@/hooks/use-auth";
import {
  createMovement,
  createStockIn,
  getCabinets,
  getInputs,
  getMedicines,
  getResidents,
} from "@/api/requests";
import { useNavigate } from "react-router-dom";

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
    const fetchMedicines = async () => {
      try {
        await getMedicines().then((data) => {
          setMedicines(data);
        });
      } catch (err) {
        console.error("Erro ao buscar medicines:", err);
      }
    };

    const fetchInputs = async () => {
      try {
        await getInputs().then((data) => {
          setInputs(data);
        });
      } catch (err) {
        console.error("Erro ao buscar inputs:", err);
      }
    };

    const fetchCaselas = async () => {
      try {
        await getResidents().then((data) => {
          setCaselas(data);
        });
      } catch (err) {
        console.error("Erro ao buscar caselas:", err);
      }
    };

    const fetchCabinets = async () => {
      try {
        await getCabinets().then((data) => {
          setCabinets(data);
        });
      } catch (err) {
        console.error("Erro ao buscar armários:", err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchMedicines(),
        fetchInputs(),
        fetchCaselas(),
        fetchCabinets(),
      ]);
      setLoading(false);
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
        tipo: "entrada",
        login_id: user?.id!,
        medicamento_id: data.id,
        armario_id: data.cabinet,
        casela_id: data.casela ?? null,
        quantidade: data.quantity,
        validade_medicamento: data.expirationDate ?? null,
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
        tipo: "insumo",
        insumo_id: data.inputId,
        quantidade: data.quantity,
        armario_id: data.cabinetId,
        validade: data.validity
      };

      await createStockIn(payload);

      await createMovement({
        tipo: "entrada",
        login_id: user?.id!,
        insumo_id: data.inputId,
        armario_id: data.cabinetId,
        quantidade: data.quantity,
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
  }));

  return (
    <Layout title="Entrada de Estoque">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando dados..."
      />

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
