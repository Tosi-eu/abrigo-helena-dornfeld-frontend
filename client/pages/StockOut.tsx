import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast.hook";
import { useAuth } from "@/hooks/use-auth.hook";
import { useNavigate } from "react-router-dom";
import {
  createMovement,
  createStockOut,
  getStock as apiGetStock,
} from "@/api/requests";

import { AnimatePresence, motion } from "framer-motion";
import Pagination from "@/components/Pagination";
import QuantityStep from "@/components/QuantityStep";

import { MovementType, OperationType, StockWizardSteps } from "@/utils/enums";
import { StockItemRaw } from "@/interfaces/interfaces";
import StepType from "@/components/StepType";
import StepItems from "@/components/StepItens";
import { fetchAllPaginated } from "@/helpers/pagination.helper";

const UI_PAGE_SIZE = 6;

export default function StockOut() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItemRaw[]>([]);

  const [uiPage, setUiPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    nome: "",
    armario: "",
    origem: "",
  });

  const [step, setStep] = useState<StockWizardSteps>(StockWizardSteps.TIPO);
  const [operationType, setOperationType] = useState<
    OperationType | "Selecione"
  >("Selecione");
  const [selected, setSelected] = useState<StockItemRaw | null>(null);
  const [quantity, setQuantity] = useState("");

  async function fetchStock() {
    setLoading(true);

    try {
      const allItems = await fetchAllPaginated(
        (page, limit) =>
          apiGetStock(
            page,
            limit,
            operationType !== "Selecione" ? operationType : undefined,
          ),
        100,
      );

      setItems(allItems as StockItemRaw[]);
      setTotalPages(Math.max(1, Math.ceil(allItems.length / UI_PAGE_SIZE)));
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao carregar estoque",
        description: "Não foi possível carregar os dados.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStock();
  }, [operationType]);

  const paginatedItems = useMemo(() => {
    const start = (uiPage - 1) * UI_PAGE_SIZE;
    const end = start + UI_PAGE_SIZE;
    return items.slice(start, end);
  }, [items, uiPage]);

  const handleSelectType = (type: OperationType) => {
    setOperationType(type);
    setSelected(null);
    setUiPage(1);
    setStep(StockWizardSteps.ITENS);
  };

  const handleSelectItem = (item: StockItemRaw | null) => {
    setSelected(item);
    if (item) setStep(StockWizardSteps.QUANTIDADE);
  };

  const handleConfirm = async () => {
    if (!selected) return;

    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    try {
      await createStockOut({
        estoqueId: selected.estoque_id,
        tipo: selected.tipo_item as OperationType,
        quantidade: qty,
      });

      await createMovement({
        tipo: MovementType.OUT,
        login_id: user?.id,
        armario_id: selected.armario_id,
        casela_id: selected.casela_id ?? null,
        quantidade: qty,
        validade: selected.validade,
        ...(selected.tipo_item === "medicamento"
          ? { medicamento_id: selected.item_id }
          : { insumo_id: selected.item_id }),
      });

      toast({
        title: "Saída registrada!",
        description: "Item removido do estoque.",
        variant: "success",
      });

      navigate("/stock");
    } catch (err: any) {
      toast({
        title: "Erro ao registrar saída",
        description: err.message || "Erro inesperado.",
        variant: "error",
      });
    }
  };

  const handleBack = () => {
    if (step === StockWizardSteps.ITENS) {
      setStep(StockWizardSteps.TIPO);
    } else if (step === StockWizardSteps.QUANTIDADE) {
      setStep(StockWizardSteps.ITENS);
    }
  };

  const handleNext = () => {
    if (step === StockWizardSteps.TIPO && operationType !== "Selecione") {
      setStep(StockWizardSteps.ITENS);
    } else if (step === StockWizardSteps.ITENS && selected) {
      setStep(StockWizardSteps.QUANTIDADE);
    }
  };

  return (
    <Layout title="Saída de Estoque">
      <div className="bg-white p-6 rounded-lg border border-gray-300 max-w-7xl mx-auto mt-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg"
              value={filters.nome}
              onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">Armário</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg"
              value={filters.armario}
              onChange={(e) =>
                setFilters({ ...filters, armario: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">Origem</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg"
              value={filters.origem}
              onChange={(e) =>
                setFilters({ ...filters, origem: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden max-w-7xl mx-auto bg-white border border-slate-400 rounded-xl p-10 px-16 shadow-sm mt-10">
        {step !== StockWizardSteps.TIPO && (
          <button
            onClick={handleBack}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full border bg-white shadow"
          >
            ←
          </button>
        )}

        {step !== StockWizardSteps.QUANTIDADE && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full border bg-white shadow"
          >
            →
          </button>
        )}

        <div className="min-h-[380px] flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {step === StockWizardSteps.TIPO && (
              <motion.div
                key="tipo"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="w-full max-w-md"
              >
                <StepType value={operationType} onSelect={handleSelectType} />
              </motion.div>
            )}

            {step === StockWizardSteps.ITENS && (
              <motion.div
                key="itens"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                <StepItems
                  items={paginatedItems}
                  allItemsCount={items.length}
                  page={uiPage}
                  pageSize={UI_PAGE_SIZE}
                  totalPages={totalPages}
                  selected={selected}
                  onSelectItem={handleSelectItem}
                  onBack={() => setStep(StockWizardSteps.TIPO)}
                  setPage={setUiPage}
                />
              </motion.div>
            )}

            {step === StockWizardSteps.QUANTIDADE && (
              <motion.div
                key="quantidade"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="w-full max-w-6xl"
              >
                <QuantityStep
                  item={selected}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  onBack={() => setStep(StockWizardSteps.ITENS)}
                  onConfirm={handleConfirm}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === StockWizardSteps.ITENS && (
          <div className="mt-8 flex justify-center">
            <Pagination
              page={uiPage}
              totalPages={totalPages}
              onChange={setUiPage}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
