import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { SkeletonTable } from "@/components/SkeletonTable";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StockItem, StockItemRaw } from "@/interfaces/interfaces";
import { lazy, Suspense } from "react";

const ReportModal = lazy(() => import("@/components/ReportModal"));
import {
  getStock,
  removeIndividualMedicineFromStock,
  resumeMedicineFromStock,
  suspendMedicineFromStock,
  removeIndividualInputFromStock,
  resumeInputFromStock,
  suspendInputFromStock,
  transferStockSector,
} from "@/api/requests";
import { ItemStockType, OperationType, SectorType, StockTypeLabels } from "@/utils/enums";
import { StockActionType, StockItemType } from "@/interfaces/types";
import ConfirmActionModal from "@/components/ConfirmationActionModal";
import {
  actionConfig,
  actionMessages,
  actionTitles,
} from "@/helpers/toaster.helper";
import { toast } from "@/hooks/use-toast.hook";
import { fetchAllPaginated } from "@/helpers/paginacao.helper";

export default function Stock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, filter } = location.state || {};

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [allRawData, setAllRawData] = useState<StockItemRaw[]>([]);
  const [page, setPage] = useState(1);
  const limit = 8;
  const [hasNext, setHasNext] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: StockActionType;
    row: StockItem | null;
  }>({ type: null, row: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatStockItems = (raw: StockItemRaw[]): StockItem[] => {
    return raw.map((item) => ({
      id: item.estoque_id,
      name: item.nome || "-",
      activeSubstance: item.principio_ativo || "-",
      description: item.descricao || "-",
      expiry: item.validade || "-",
      quantity: Number(item.quantidade) || 0,
      cabinet: item.armario_id ?? "-",
      drawer: item.gaveta_id ?? "-",
      casela: item.casela_id ?? "-",
      stockType: StockTypeLabels[item.tipo as ItemStockType] ?? item.tipo,
      tipo: item.tipo,
      patient: item.paciente || "-",
      origin: item.origem || "-",
      minimumStock: item.minimo || 0,
      expirationMsg: item.msg_expiracao,
      quantityMsg: item.msg_quantidade,
      expirationStatus: item.st_expiracao,
      quantityStatus: item.st_quantidade,
      status: item.status || null,
      suspended_at: item.suspenso_em ? new Date(item.suspenso_em) : null,
      itemType: item.tipo_item as OperationType,
      sector: item.setor,
      lot: item.lote ?? null,
      preco: item.preco ? Number(item.preco) : null,
    }));
  };

  async function loadStock(pageToLoad: number) {
    setLoading(true);
    try {
      const res = await getStock(pageToLoad, limit);

      setItems(formatStockItems(res.data));
      setHasNext(res.hasNext);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os itens do estoque.";
      toast({
        title: "Erro ao carregar estoque",
        description: errorMessage,
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadAllStock() {
    try {
      const allItems = await fetchAllPaginated(
        (page, limit) => getStock(page, limit),
        100,
      );
      setAllRawData(allItems as StockItemRaw[]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar todos os itens do estoque.";
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "error",
        duration: 3000,
      });
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);

      if (data && Array.isArray(data)) {
        if (data.length > 0) {
          setItems(formatStockItems(data));
        } else {
          setItems([]);
        }
        setHasNext(false);
        setLoading(false);
        try {
          await loadAllStock();
        } catch (err) {
          console.error("Error loading all stock:", err);
        }
        return;
      }

      await loadStock(1);
      await loadAllStock();
    }

    init();
  }, []);

  useEffect(() => {
    if ((!data || !Array.isArray(data)) && page > 1) {
      loadStock(page);
    }
  }, [page]);

  const columns = [
    { key: "stockType", label: "Tipo", editable: false },
    { key: "name", label: "Nome", editable: true },
    { key: "activeSubstance", label: "P. Ativo", editable: true },
    { key: "description", label: "Descrição", editable: true },
    { key: "expiry", label: "Validade", editable: true },
    { key: "quantity", label: "Quantidade", editable: true },
    { key: "cabinet", label: "Armário", editable: false },
    { key: "drawer", label: "Gaveta", editable: false },
    { key: "casela", label: "Casela", editable: false },
    { key: "origin", label: "Origem", editable: false },
    { key: "sector", label: "Setor", editable: false },
    { key: "status", label: "Status", editable: false },
    { key: "lot", label: "Lote", editable: false },
  ];

  const requestTransferSector = (row: StockItem) => {
    setPendingAction({
      type: "transfer",
      row,
    });
    setConfirmOpen(true);
  };

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

  const handleConfirmAction = async () => {
    if (!pendingAction.row || !pendingAction.type) return;

    const { row, type } = pendingAction;

    setActionLoading(true);

    try {
      if (type === "remove") {
        if (row.itemType === "medicamento") {
          await removeIndividualMedicineFromStock(row.id);
        } else if (row.itemType === "insumo") {
          await removeIndividualInputFromStock(row.id);
        }
      }

      if (type === "suspend") {
        if (row.itemType === "medicamento") {
          await suspendMedicineFromStock(row.id);
        } else if (row.itemType === "insumo") {
          await suspendInputFromStock(row.id);
        }
      }

      if (type === "resume") {
        if (row.itemType === "medicamento") {
          await resumeMedicineFromStock(row.id);
        } else if (row.itemType === "insumo") {
          await resumeInputFromStock(row.id);
        }
      }

      if (type === "transfer") {
        const nextSector =
          row.sector === "farmacia" ? "enfermagem" : "farmacia";

        await transferStockSector({
          estoque_id: row.id,
          setor: nextSector as SectorType,
          itemType: row.itemType as StockItemType,
        });
      }

      await loadStock(page);
      await loadAllStock();

      if (type === "transfer") {
        const messages = actionMessages.transfer(row);
        toast({ title: messages.success, variant: "success", duration: 3000 });
      } else {
        toast({
          title: actionMessages[type].success,
          variant: "success",
          duration: 3000,
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || "Ocorreu um erro ao executar a ação.";

      if (type === "transfer") {
        const messages = actionMessages.transfer(row);
        toast({
          title: messages.error,
          description: errorMessage,
          variant: "error",
        });
      } else {
        toast({
          title: actionMessages[type].error,
          description: errorMessage,
          variant: "error",
          duration: 3000,
        });
      }

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
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() =>
              navigate("/stock/out", {
                state: { data: allRawData.length > 0 ? allRawData : undefined },
              })
            }
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

        <div className="pt-8">
          <div className="w-full mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            {loading ? (
              <SkeletonTable rows={8} cols={columns.length} />
            ) : (
              <EditableTable
                data={items}
                columns={columns}
                showAddons={true}
                currentPage={page}
                hasNextPage={hasNext}
                onNextPage={() => setPage((p) => p + 1)}
                onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                onTransferSector={requestTransferSector}
                onRemoveIndividual={requestRemoveIndividual}
                onSuspend={requestSuspend}
                onResume={requestResume}
                onDeleteSuccess={() => {
                  if (!data) {
                    loadStock(page);
                    loadAllStock();
                  }
                }}
                entityType="stock"
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={confirmOpen}
        loading={actionLoading}
        title={pendingAction.type ? actionTitles[pendingAction.type] : ""}
        description={
          pendingAction.type
            ? actionConfig[pendingAction.type].description(pendingAction.row)
            : ""
        }
        confirmLabel="Confirmar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      <Suspense fallback={null}>
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      </Suspense>
    </Layout>
  );
}
