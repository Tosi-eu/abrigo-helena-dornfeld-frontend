import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { createMovement, createStockOut, getStock } from "@/api/requests";
import { useNavigate } from "react-router-dom";
import LoadingModal from "@/components/LoadingModal";
import { useAuth } from "@/hooks/use-auth";
import StockOutWizard from "@/components/StockOutWizard";

export default function StockOut() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nome: "", armario: "", origem: "" });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const data = await getStock();
        setItems(data);
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
        ...(payload.tipoItem === "medicamento" && payload.validity
          ? { expirationDate: new Date(payload.validity) }
          : {}),
        ...(payload.tipoItem === "medicamento"
          ? {
              medicamento_id: payload.itemId,
              validade_medicamento: payload.validity
                ? new Date(payload.validity).toISOString()
                : null,
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
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando dados..."
      />

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Nome</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={filters.nome}
              onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">Armário</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={filters.armario}
              onChange={(e) => setFilters({ ...filters, armario: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">Origem</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={filters.origem}
              onChange={(e) => setFilters({ ...filters, origem: e.target.value })}
            />
          </div>
        </div>
      </div>

      {!loading && (
        <div className="max-w-8xl mx-auto mt-10">
          <StockOutWizard
            items={items}
            filters={filters}
            setFilters={setFilters}
            onSubmit={handleStockOut}
          />
        </div>
      )}
    </Layout>
  );
}
