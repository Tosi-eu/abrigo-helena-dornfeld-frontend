import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StockItem } from "@/interfaces/interfaces";
import ReportModal from "@/components/ReportModal";
import LoadingModal from "@/components/LoadingModal";
import { getStock } from "@/api/requests";
import { StockType, StockTypeLabels } from "@/enums/enums";

export default function Stock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const formatStockItems = (raw: any[]): StockItem[] => {

    return raw.map((item) => ({
      name: item.nome || "-",
      description: item.principio_ativo || item.descricao || "-",
      expiry: item.validade || "-",
      quantity: Number(item.quantidade) || 0,
      cabinet: item.armario_id ?? "-",
      casela: item.casela_id ?? "-",
      stockType: StockTypeLabels[item.tipo as StockType] ?? item.tipo,
      patient: item.paciente || "-",
      origin: item.origem || "-",
      minimumStock: item.minimo || 0,
    }));
  };

  useEffect(() => {
    async function loadStock() {
      try {
        if(data) {
          setItems(formatStockItems(data));
          return;
        }

        setLoading(true);
        let stockData: any[] = [];

        stockData = await getStock().then((res) => res);

        setItems(formatStockItems(stockData));
      } catch (err) {
        console.error("Erro ao buscar estoque:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStock();
  }, []);

  const columns = [
    { key: "stockType", label: "Tipo de Estoque", editable: false },
    { key: "name", label: "Nome", editable: true },
    {
      key: "description",
      label: "Descrição / Princípio Ativo",
      editable: true,
    },
    { key: "expiry", label: "Validade", editable: true },
    { key: "quantity", label: "Quantidade", editable: true },
    { key: "patient", label: "Residente", editable: false },
    { key: "cabinet", label: "Armário", editable: false },
    { key: "casela", label: "Casela", editable: false },
    { key: "origin", label: "Origem", editable: false },
  ];

  return (
    <Layout title="Estoque de Medicamentos e Insumos">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando estoque..."
      />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/stock/in")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            disabled={loading}
          >
            Entrada de Estoque
          </button>

          <button
            onClick={() => navigate("/stock/out")}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            disabled={loading}
          >
            Saída de Estoque
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition"
            disabled={loading}
          >
            Gerar Relatório
          </button>
        </div>

        {!loading && (
          <>
            <h2 className="text-lg font-semibold mt-6">Visão Geral do Estoque</h2>
            <EditableTable data={items} columns={columns} showAddons={false} />
          </>
        )}
      </div>

      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </Layout>
  );
}
