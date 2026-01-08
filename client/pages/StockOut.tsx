import { useEffect, useState, useMemo } from "react";
import { Controller } from "react-hook-form";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast.hook";
import { getErrorMessage } from "@/helpers/validation.helper";
import { useFormWithZod } from "@/hooks/use-form-with-zod";
import { stockOutTypeSchema, stockOutQuantitySchema, type StockOutTypeFormData, type StockOutQuantityFormData } from "@/schemas/stock-out.schema";
import { useAuth } from "@/hooks/use-auth.hook";
import { useNavigate, useLocation } from "react-router-dom";
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
import { fetchAllPaginated } from "@/helpers/paginacao.helper";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const UI_PAGE_SIZE = 6;

export default function StockOut() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: passedData } = location.state || {};

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
  const [selected, setSelected] = useState<StockItemRaw | null>(null);

  const {
    control: typeControl,
    watch: watchType,
    handleSubmit: handleTypeSubmit,
    setValue: setTypeValue,
    formState: { errors: typeErrors },
  } = useFormWithZod(stockOutTypeSchema, {
    defaultValues: {
      operationType: undefined,
    },
  });

  const operationType = watchType("operationType");

  const {
    register: quantityRegister,
    handleSubmit: handleQuantitySubmit,
    watch: watchQuantity,
    formState: { errors: quantityErrors, isSubmitting: isSubmittingQuantity },
  } = useFormWithZod(stockOutQuantitySchema, {
    defaultValues: {
      quantity: 0,
    },
  });

  const quantity = watchQuantity("quantity");

  async function fetchStock() {
    setLoading(true);
    try {

      if (passedData && passedData.length > 0) {
        const filtered =
          operationType
            ? passedData.filter(
                (item: StockItemRaw) => item.tipo_item === operationType,
              )
            : passedData;
        setItems(filtered as StockItemRaw[]);
      }
    } catch (err: unknown) {
      toast({
        title: "Erro ao carregar estoque",
        description: getErrorMessage(err, "Não foi possível carregar os dados."),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (operationType) {
      fetchStock();
      setUiPage(1);
      setSelected(null);
    }
  }, [operationType]);

  const nameOptions = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.nome).filter(Boolean))).map(
        (name) => ({ label: name, value: name }),
      ),
    [items],
  );

  const cabinetOptions = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.armario_id).filter(Boolean))).map(
        (id) => ({ label: `Armário ${id}`, value: String(id) }),
      ),
    [items],
  );

  const originOptions = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.origem).filter(Boolean))).map(
        (o) => ({ label: o, value: o }),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.nome && item.nome !== filters.nome) return false;
      if (filters.armario && String(item.armario_id ?? "") !== filters.armario)
        return false;
      if (filters.origem && item.origem !== filters.origem) return false;
      return true;
    });
  }, [items, filters]);

  const paginatedItems = useMemo(() => {
    const start = (uiPage - 1) * UI_PAGE_SIZE;
    const end = start + UI_PAGE_SIZE;
    return filteredItems.slice(start, end);
  }, [filteredItems, uiPage]);

  useEffect(() => {
    setUiPage(1);
    setSelected(null);
    setTotalPages(Math.max(1, Math.ceil(filteredItems.length / UI_PAGE_SIZE)));
  }, [filteredItems]);

  const handleSelectType = (type: OperationType) => {
    setTypeValue("operationType", type);
    setStep(StockWizardSteps.ITENS);
  };

  const handleSelectItem = (item: StockItemRaw | null) => {
    setSelected(item);
    if (item) setStep(StockWizardSteps.QUANTIDADE);
  };

  const handleConfirm = async (data: StockOutQuantityFormData) => {
    if (!selected) return;

    try {
      await createStockOut({
        estoqueId: selected.estoque_id,
        tipo: selected.tipo_item as OperationType,
        quantidade: data.quantity,
      });

      await createMovement({
        tipo: MovementType.OUT,
        login_id: user?.id,
        armario_id: selected.armario_id ?? null,
        gaveta_id: selected.gaveta_id ?? null,
        casela_id: selected.casela_id ?? null,
        quantidade: data.quantity,
        validade: selected.validade,
        ...(selected.tipo_item === "medicamento"
          ? { medicamento_id: selected.item_id }
          : { insumo_id: selected.item_id }),
        setor: selected.setor,
      });

      toast({
        title: "Saída registrada!",
        description: "Item removido do estoque.",
        variant: "success",
      });

      navigate("/stock");
    } catch (err: unknown) {
      toast({
        title: "Erro ao registrar saída",
        description: getErrorMessage(err, "Erro inesperado ao registrar saída."),
        variant: "error",
      });
    }
  };

  const handleBack = () => {
    if (step === StockWizardSteps.ITENS) setStep(StockWizardSteps.TIPO);
    else if (step === StockWizardSteps.QUANTIDADE)
      setStep(StockWizardSteps.ITENS);
  };

  const handleNext = () => {
    if (step === StockWizardSteps.TIPO) {
      handleTypeSubmit((data: StockOutTypeFormData) => {
        setStep(StockWizardSteps.ITENS);
      })();
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
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full border border-gray-300 p-2 rounded-lg flex justify-between items-center bg-white">
                  {filters.nome || "Selecione"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar nome..." />
                  <CommandEmpty>Nenhum item encontrado</CommandEmpty>
                  <CommandGroup>
                    {nameOptions.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={o.value}
                        onSelect={() =>
                          setFilters((prev) => ({
                            ...prev,
                            nome: prev.nome === o.value ? "" : o.value,
                          }))
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.nome === o.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {o.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">Armário</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full border border-gray-300 p-2 rounded-lg flex justify-between items-center bg-white">
                  {filters.armario || "Selecione"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar armário..." />
                  <CommandEmpty>Nenhum item encontrado</CommandEmpty>
                  <CommandGroup>
                    {cabinetOptions.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={o.value}
                        onSelect={() =>
                          setFilters((prev) => ({
                            ...prev,
                            armario: prev.armario === o.value ? "" : o.value,
                          }))
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.armario === o.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {o.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">Origem</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full border border-gray-300 p-2 rounded-lg flex justify-between items-center bg-white">
                  {filters.origem || "Selecione"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar origem..." />
                  <CommandEmpty>Nenhum item encontrado</CommandEmpty>
                  <CommandGroup>
                    {originOptions.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={o.value}
                        onSelect={() =>
                          setFilters((prev) => ({
                            ...prev,
                            origem: prev.origem === o.value ? "" : o.value,
                          }))
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.origem === o.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {o.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
                <Controller
                  name="operationType"
                  control={typeControl}
                  render={({ field }) => (
                    <>
                      <StepType 
                        value={field.value} 
                        onSelect={(type) => {
                          field.onChange(type);
                          handleSelectType(type);
                        }} 
                      />
                      {typeErrors.operationType && (
                        <p className="text-sm text-red-600 mt-2 text-center">
                          {typeErrors.operationType.message}
                        </p>
                      )}
                    </>
                  )}
                />
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
                  allItemsCount={filteredItems.length}
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
                  quantityRegister={quantityRegister}
                  quantityErrors={quantityErrors}
                  isSubmitting={isSubmittingQuantity}
                  onBack={() => setStep(StockWizardSteps.ITENS)}
                  onConfirm={handleQuantitySubmit(handleConfirm)}
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
