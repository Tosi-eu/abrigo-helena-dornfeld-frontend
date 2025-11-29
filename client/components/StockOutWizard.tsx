import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OperationType, StockWizardSteps } from "@/enums/enums";
import StepType from "./StepType";
import StepItems from "./ItemsStep";
import QuantityStep from "./QuantityStep";
import Pagination from "./Pagination";
import { StockItemRaw } from "@/interfaces/interfaces";

interface Filters {
  nome: string;
  armario: string;
  origem: string;
}

interface Props {
  items: StockItemRaw[];
  pageSize?: number;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onSubmit: (data: {
    itemId: number;
    estoqueId: number;
    tipoItem: OperationType | string;
    armarioId: number;
    caselaId?: number;
    quantity: number;
    validity: string | null;
    resident: string | null;
  }) => void;
}

export default function StockOutWizard({
  items,
  pageSize = 12,
  filters,
  setFilters,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<StockWizardSteps>(StockWizardSteps.TIPO);
  const [operationType, setOperationType] = useState<OperationType | "Selecione">("Selecione");
  const [selected, setSelected] = useState<StockItemRaw | null>(null);
  const [page, setPage] = useState(1);
  const [quantity, setQuantity] = useState<string>("");

  const filteredItems = useMemo(() => {
    const base = items.filter((i) =>
      operationType === "Selecione" ? true : i.tipo_item === operationType
    );

    return base.filter((item) => {
      const matchesNome = filters.nome ? item.nome.toLowerCase().includes(filters.nome.toLowerCase()) : true;
      const matchesArmario = filters.armario ? String(item.armario_id ?? "").includes(filters.armario) : true;
      const matchesOrigem = filters.origem ? (item.origem ?? "").toLowerCase().includes(filters.origem.toLowerCase()) : true;
      return matchesNome && matchesArmario && matchesOrigem;
    });
  }, [items, filters, operationType]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const handleSelectType = (type: OperationType) => {
    setOperationType(type);
    setPage(1);
    setSelected(null);
    setStep(StockWizardSteps.ITENS);
  };

  const handleSelectItem = (item: StockItemRaw | null) => {
    setSelected(item);
    if (item) setStep(StockWizardSteps.QUANTIDADE);
  };

  const handleConfirm = () => {
    if (!selected) return;

    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    onSubmit({
      itemId: selected.item_id,
      estoqueId: selected.estoque_id,
      tipoItem: selected.tipo_item,
      armarioId: selected.armario_id ?? 0,
      caselaId: selected.casela_id ?? undefined,
      quantity: qty,
      validity: selected.validade ? new Date(selected.validade).toISOString() : null,
      resident: selected.paciente ?? null,
    });

    setQuantity("");
    setSelected(null);
    setOperationType("Selecione");
    setStep(StockWizardSteps.TIPO);
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
    <div className="relative overflow-hidden max-w-7xl mx-auto bg-white border border-slate-400 rounded-xl p-10 px-16 shadow-sm">

      {step !== StockWizardSteps.TIPO && (
        <button
          onClick={handleBack}
          className="
            absolute left-2 top-1/2 -translate-y-1/2 
            p-3 rounded-full border bg-white shadow 
            z-20 hover:bg-slate-50
          "
          aria-label="Voltar"
        >
          <span className="text-xl">←</span>
        </button>
      )}

      {step !== StockWizardSteps.QUANTIDADE && (
        <button
          onClick={handleNext}
          className="
            absolute right-2 top-1/2 -translate-y-1/2 
            p-3 rounded-full border bg-white shadow 
            hover:bg-slate-50
          "
          aria-label="Avançar"
        >
          <span className="text-xl">→</span>
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
                items={paginated}
                allItemsCount={filteredItems.length}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                selected={selected}
                onSelectItem={handleSelectItem}
                onBack={() => setStep(StockWizardSteps.TIPO)}
                setPage={setPage}
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
              className="w-full max-w-lg"
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
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
