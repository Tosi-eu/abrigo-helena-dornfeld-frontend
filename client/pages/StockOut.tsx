import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { OperationType } from "@/enums/enums";
import { StockOutForm } from "@/components/StockOutForm";
import LoadingModal from "@/components/LoadingModal";
import { useAuth } from "@/hooks/use-auth";
import { createMovement, createStockOut, getStock } from "@/api/requests";
import { useNavigate } from "react-router-dom";

export default function StockOut() {
  const [operationType, setOperationType] = useState<OperationType | "Selecione">("Selecione");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [inputs, setInputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const data = await getStock();

        const meds = data.filter((item: any) => item.tipo_item === "medicamento");
        const ins = data.filter((item: any) => item.tipo_item === "insumo");

        setMedicines(meds);
        setInputs(ins);
      } catch (err) {
        console.error("Erro ao buscar estoque:", err);
        toast({
          title: "Erro ao carregar estoque",
          description: "Não foi possível carregar os dados do estoque.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const handleStockOut = async (payload: any) => {
    if (!payload) return;

    try {
      await createStockOut({
        estoqueId: payload.estoqueId, 
        tipo: payload.tipoItem,   
        quantidade: Number(payload.quantity),
      });

      await createMovement({
        tipo: "saida",
        login_id: user?.id,
        armario_id: payload.armarioId,
        casela_id: payload.caselaId ?? null,
        quantidade: Number(payload.quantity),
        ...(payload.tipo_item === "medicamento" && payload.validity
          ? { expirationDate: new Date(payload.validity) }
          : {}),
        ...(payload.tipo_item === "medicamento"
          ? {
              medicamento_id: payload.itemId,
              validade_medicamento: payload.validity ? new Date(payload.validity).toISOString() : null,
            }
          : { insumo_id: payload.itemId }),
      });

      toast({
        title: "Saída registrada com sucesso!",
        description: `${payload.tipoItem === "medicamento" ? "Medicamento" : "Insumo"} removido do estoque.`,
        variant: "success",
      });

      navigate("/stock");
    } catch (err: any) {
      toast({
        title: "Erro ao registrar saída",
        description: err.message || "Erro inesperado ao processar a saída.",
        variant: "error",
      });
    }
  };

  return (
    <Layout title="Saída de Estoque">
      <LoadingModal open={loading} title="Aguarde" description="Carregando dados..." />

      {!loading && (
        <div className="max-w-5xl mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Registrar Saída</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de saída
            </label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value as OperationType)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 hover:border-slate-400"
            >
              <option value="Selecione">Selecione</option>
              <option value={OperationType.MEDICINE}>{OperationType.MEDICINE}</option>
              <option value={OperationType.INPUT}>{OperationType.INPUT}</option>
            </select>
          </div>

          {operationType === OperationType.MEDICINE && (
            <StockOutForm
              items={medicines.map((m) => ({
                tipo_item: m.tipo_item,
                estoque_id: m.estoque_id,
                item_id: m.item_id,
                nome: m.nome,
                detalhes: `${m.principio_ativo}`,
                quantidade: Number(m.quantidade),
                validade: m.validade,
                origem: m.origem,
                armario_id: m.armario_id,
                casela_id: m.casela_id,
                paciente: m.paciente,
              }))}
              onSubmit={(data) => handleStockOut(data)}
            />
          )}

          {operationType === OperationType.INPUT && (
            <StockOutForm
              items={inputs.map((i) => ({
                tipo_item: i.tipo_item,
                estoque_id: i.estoque_id,
                item_id: i.item_id,
                nome: i.nome,
                quantidade: Number(i.quantidade),
                origem: i.origem,
                armario_id: i.armario_id,
                casela_id: i.casela_id,
              }))}
              onSubmit={(data) => handleStockOut(data)}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
