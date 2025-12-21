import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StockItem } from "@/interfaces/interfaces";
import ReportModal from "@/components/ReportModal";
import {
  getStock,
  removeIndividualMedicineFromStock,
  resumeMedicineFromStock,
  suspendMedicineFromStock,
} from "@/api/requests";
import { MedicineStockType, StockTypeLabels } from "@/utils/enums";
import { StockActionType } from "@/interfaces/types";
import ConfirmActionModal from "@/components/ConfirmationActionModal";

export default function Stock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 8;
  const [hasNext, setHasNext] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: StockActionType;
    row: StockItem | null;
  }>({ type: null, row: null });
  const [actionLoading, setActionLoading] = useState(false);

  const formatStockItems = (raw: any[]): StockItem[] => {
    return raw.map((item) => ({
      id: item.estoque_id,
      name: item.nome || "-",
      description: item.principio_ativo || item.descricao || "-",
      expiry: item.validade || "-",
      quantity: Number(item.quantidade) || 0,
      cabinet: item.armario_id ?? "-",
      drawer: item.gaveta_id ?? "-",
      casela: item.casela_id ?? "-",
      stockType: StockTypeLabels[item.tipo as MedicineStockType] ?? item.tipo,
      patient: item.paciente || "-",
      origin: item.origem || "-",
      minimumStock: item.minimo || 0,
      expirationMsg: item.msg_expiracao,
      quantityMsg: item.msg_quantidade,
      expirationStatus: item.st_expiracao,
      quantityStatus: item.st_quantidade,
      status: item.status || null,
      suspended_at: item.suspenso_em ? new Date(item.suspenso_em) : null,
      itemType: item.tipo_item,
    }));
  };

  async function loadStock(pageToLoad: number) {
    try {
      setLoading(true);

      if (data) {
        setItems(formatStockItems(data));
        setHasNext(false);
        return;
      }

      const res = await getStock(pageToLoad, limit);

      setItems(formatStockItems(res.data));
      setHasNext(res.hasNext);
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      if (data) {
        setItems(formatStockItems(data));
        setHasNext(false);
        setLoading(false);
        return;
      }

      await loadStock(1);
    }

    init();
  }, []);

  useEffect(() => {
    if (!data) {
      loadStock(page);
    }
  }, [page]);

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
    { key: "drawer", label: "Gaveta", editable: false },
    { key: "casela", label: "Casela", editable: false },
    { key: "origin", label: "Origem", editable: false },
    { key: "status", label: "Status", editable: false },
  ];

  const requestRemoveIndividual = (row: StockItem) => {
    setPendingAction({
      type: "remove",
      row,
    });
    setConfirmOpen(true);
  };

  const requestSuspend = (row: StockItem) => {
    setPendingAction({
      type: "suspend",
      row,
    });
    setConfirmOpen(true);
  };

  const requestResume = (row: StockItem) => {
    setPendingAction({
      type: "resume",
      row,
    });
    setConfirmOpen(true);
  };

  const updateItemLocally = (
    id: number,
    updater: (item: StockItem) => StockItem,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updater(item) : item)),
    );
  };

  const handleConfirmAction = async () => {
    if (!pendingAction.row || !pendingAction.type) return;

    const { row, type } = pendingAction;

    setActionLoading(true);

    try {
      if (type === "remove") {
        updateItemLocally(row.id, (item) => ({
          ...item,
          patient: "-",
          casela: "-",
        }));

        await removeIndividualMedicineFromStock(row.id);
      }

      if (type === "suspend") {
        updateItemLocally(row.id, (item) => ({
          ...item,
          status: "suspended",
          suspended_at: new Date(),
        }));

        await suspendMedicineFromStock(row.id);
      }

      if (type === "resume") {
        updateItemLocally(row.id, (item) => ({
          ...item,
          status: "active",
          suspended_at: null,
        }));

        await resumeMedicineFromStock(row.id);
      }
    } catch (err) {
      console.error("Erro ao executar ação", err);

      await loadStock(page);
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
      setPendingAction({ type: null, row: null });
    }
  };

  return (
    <Layout title="Estoque de Medicamentos e Insumos">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/stock/in")}
            disabled={loading}
            className="
              h-12 px-6 rounded-lg font-semibold
              bg-green-600 text-white
              shadow-md hover:bg-green-700 hover:shadow-lg active:bg-green-800 active:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all ease-in-out duration-200
            "
          >
            Entrada de Estoque
          </button>

          <button
            onClick={() => navigate("/stock/out")}
            disabled={loading}
            className="
              h-12 px-6 rounded-lg font-semibold
              bg-red-600 text-white
              shadow-md hover:bg-red-700 hover:shadow-lg active:bg-red-800 active:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all ease-in-out duration-200
            "
          >
            Saída de Estoque
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            disabled={loading}
            className="
              h-12 px-6 rounded-lg font-semibold
              bg-sky-600 text-white
              shadow-md hover:bg-sky-700 hover:shadow-lg active:bg-sky-800 active:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all ease-in-out duration-200
            "
          >
            Gerar Relatório
          </button>
        </div>

        <div className="pt-12">
          {!loading && (
            <>
              <EditableTable
                data={items}
                columns={columns}
                showAddons={true}
                currentPage={page}
                hasNextPage={hasNext}
                onNextPage={() => setPage((p) => p + 1)}
                onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                onRemoveIndividual={requestRemoveIndividual}
                onSuspend={requestSuspend}
                onResume={requestResume}
                entityType="stock"
              />
            </>
          )}
        </div>
      </div>

      <ConfirmActionModal
        open={confirmOpen}
        loading={actionLoading}
        title={
          pendingAction.type === "remove"
            ? "Remover medicamento do paciente"
            : pendingAction.type === "suspend"
              ? "Suspender medicamento"
              : "Reativar medicamento"
        }
        description={
          pendingAction.type === "remove"
            ? "O medicamento será desvinculado do paciente e retornará ao estoque geral. Deseja continuar?"
            : pendingAction.type === "suspend"
              ? "O medicamento ficará suspenso e não poderá ser utilizado. Deseja continuar?"
              : "O medicamento será reativado e poderá ser utilizado novamente. Deseja continuar?"
        }
        confirmLabel="Confirmar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </Layout>
  );
}
