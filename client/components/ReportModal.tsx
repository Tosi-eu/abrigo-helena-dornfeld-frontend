import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Package,
  Stethoscope,
  Check,
  X,
  Loader2,
  User,
  Syringe,
  Users,
  ArrowRightLeft,
  Activity,
  AlertTriangle,
  ChevronsUpDown,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { getReport, getResidents } from "@/api/requests";
import { fetchAllPaginated } from "@/helpers/paginacao.helper";
import {
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  Command,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type StatusType = "idle" | "loading" | "success" | "error";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

interface Resident {
  casela: number;
  name: string;
}

enum MovementPeriod {
  DIARIO = "diario",
  MENSAL = "mensal",
  INTERVALO = "intervalo",
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
  const [status, setStatus] = useState<StatusType>("idle");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [movementPeriod, setMovementPeriod] = useState<MovementPeriod>(
    MovementPeriod.DIARIO,
  );
  const [movementDate, setMovementDate] = useState("");
  const [movementMonth, setMovementMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [residentSearch, setResidentSearch] = useState("");

  const reportOptions = [
    { value: "insumos", label: "Insumos", icon: Package },
    { value: "medicamentos", label: "Medicamentos", icon: Stethoscope },
    { value: "residentes", label: "Residentes", icon: User },
    { value: "psicotropicos", label: "Psicotrópicos", icon: Syringe },
    {
      value: "insumos_medicamentos",
      label: "Insumos e Medicamentos",
      icon: Check,
    },
    {
      value: "residente_consumo",
      label: "Consumo por Residente",
      icon: Users,
    },
    {
      value: "transferencias",
      label: "Transferências (Farmácia → Enfermaria)",
      icon: ArrowRightLeft,
    },
    {
      value: "movimentacoes",
      label: "Movimentações",
      icon: Activity,
    },
    {
      value: "medicamentos_residente",
      label: "Medicamentos por Residente",
      icon: User,
    },
    {
      value: "medicamentos_vencidos",
      label: "Medicamentos Vencidos",
      icon: AlertTriangle,
    },
  ];

  useEffect(() => {
    if (
      open &&
      (selectedReports[0] === "residente_consumo" ||
        selectedReports[0] === "medicamentos_residente")
    ) {
      loadResidents();
    }
  }, [open, selectedReports]);

  const loadResidents = async () => {
    setLoadingResidents(true);
    try {
      const residentsList = await fetchAllPaginated<Resident>(getResidents);
      setResidents(residentsList);
    } catch (error) {
      console.error("Erro ao carregar residentes:", error);
      setResidents([]);
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleSelectReport = (value: string) => {
    setSelectedReports([value]);
    if (value !== "residente_consumo" && value !== "medicamentos_residente") {
      setSelectedResident(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedReports.length) return;

    const tipo = selectedReports[0];
    setStatus("loading");

    try {
      let response;

      if (tipo === "movimentacoes") {
        let params: any;

        if (movementPeriod === MovementPeriod.DIARIO) {
          params = {
            periodo: MovementPeriod.DIARIO,
            data: movementDate,
          };
        }

        if (movementPeriod === MovementPeriod.MENSAL) {
          params = {
            periodo: MovementPeriod.MENSAL,
            mes: movementMonth,
          };
        }

        if (movementPeriod === MovementPeriod.INTERVALO) {
          params = {
            periodo: MovementPeriod.INTERVALO,
            data_inicial: startDate,
            data_final: endDate,
          };
        }

        response = await getReport("movimentacoes", undefined, params);
      } else if (tipo === "transferencias") {
        response = await getReport("transferencias");
      } else {
        const casela =
          tipo === "residente_consumo" || tipo === "medicamentos_residente"
            ? selectedResident
            : undefined;

        response = await getReport(tipo, casela);
      }

      const { createStockPDF } = await import("./StockReporter");
      const doc = createStockPDF(tipo, response);

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${tipo}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setSelectedReports([]);
    setSelectedResident(null);
    setResidentSearch("");
    onClose();
  };

  const showResidentSelector =
    selectedReports[0] === "residente_consumo" ||
    selectedReports[0] === "medicamentos_residente";

  const showMovementFilters = selectedReports[0] === "movimentacoes";

  const iconSize = 100;

  const filteredResidents = residents.filter((r) => {
    if (!residentSearch) return true;

    return r.casela.toString().startsWith(residentSearch.trim());
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 w-full flex flex-col items-center"
            >
              <DialogHeader className="w-full mb-4 text-center">
                <DialogTitle className="text-xl font-bold text-gray-800">
                  Gerar Relatório
                </DialogTitle>
              </DialogHeader>

              <div className="w-full flex flex-col gap-2 items-center">
                {reportOptions.map(({ value, label, icon: Icon }) => {
                  const isSelected = selectedReports[0] === value;

                  return (
                    <div key={value} className="w-full max-w-md">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleSelectReport(value)}
                        className={`border rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer transition-all
                    ${
                      isSelected
                        ? "border-sky-600 bg-sky-50"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                    }
                  `}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? "text-sky-600" : "text-gray-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </motion.div>

                      {isSelected && showMovementFilters && (
                        <div className="mt-2 p-3 border rounded-lg grid grid-cols-2 gap-3 text-sm">
                          <div className="col-span-2">
                            <label className="block mb-1 text-gray-600">
                              Período
                            </label>
                            <select
                              value={movementPeriod}
                              onChange={(e) =>
                                setMovementPeriod(
                                  e.target.value as MovementPeriod,
                                )
                              }
                              className="w-full border rounded px-2 py-1"
                            >
                              <option value={MovementPeriod.DIARIO}>
                                Diário
                              </option>
                              <option value={MovementPeriod.MENSAL}>
                                Mensal
                              </option>
                              <option value={MovementPeriod.INTERVALO}>
                                Intervalo
                              </option>
                            </select>
                          </div>

                          {movementPeriod === MovementPeriod.DIARIO && (
                            <div className="col-span-2">
                              <label className="block mb-1 text-gray-600">
                                Data
                              </label>
                              <input
                                type="date"
                                value={movementDate}
                                onChange={(e) =>
                                  setMovementDate(e.target.value)
                                }
                                className="w-full border rounded px-2 py-1"
                              />
                            </div>
                          )}

                          {movementPeriod === MovementPeriod.MENSAL && (
                            <div className="col-span-2">
                              <label className="block mb-1 text-gray-600">
                                Mês
                              </label>
                              <input
                                type="month"
                                value={movementMonth}
                                onChange={(e) =>
                                  setMovementMonth(e.target.value)
                                }
                                className="w-full border rounded px-2 py-1"
                              />
                            </div>
                          )}

                          {movementPeriod === MovementPeriod.INTERVALO && (
                            <>
                              <div>
                                <label className="block mb-1 text-gray-600">
                                  Data inicial
                                </label>
                                <input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="w-full border rounded px-2 py-1"
                                />
                              </div>

                              <div>
                                <label className="block mb-1 text-gray-600">
                                  Data final
                                </label>
                                <input
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  className="w-full border rounded px-2 py-1"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {isSelected && showResidentSelector && (
                        <div className="mt-2 p-3 border rounded-lg">
                          <label className="block mb-1 text-gray-600 text-sm">
                            Residente
                          </label>

                          {loadingResidents ? (
                            <div className="flex justify-center py-2">
                              <Loader2 className="animate-spin text-sky-600" />
                            </div>
                          ) : (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between text-sm"
                                >
                                  {selectedResident
                                    ? residents.find(
                                        (r) => r.casela === selectedResident,
                                      )?.name
                                    : "Selecionar residente"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent
                                side="bottom"
                                align="start"
                                sideOffset={4}
                                avoidCollisions={false}
                                className="w-full p-0"
                              >
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Buscar residente"
                                    value={residentSearch}
                                    onValueChange={setResidentSearch}
                                  />
                                  <CommandEmpty>
                                    Nenhum residente encontrado.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {filteredResidents.map((r) => (
                                      <CommandItem
                                        key={r.casela}
                                        value={
                                          r.casela?.toString() + " - " + r.name
                                        }
                                        onSelect={() => {
                                          setSelectedResident(r.casela);
                                          setResidentSearch("");
                                        }}
                                      >
                                        Casela {r.casela?.toString()}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Button
                  className="mt-4 w-full max-w-md bg-sky-600 hover:bg-sky-700 text-white"
                  disabled={
                    !selectedReports.length ||
                    (showResidentSelector && !selectedResident)
                  }
                  onClick={handleGenerate}
                >
                  Gerar relatório
                </Button>
              </div>
            </motion.div>
          )}
          {status === "loading" && (
            <div className="p-12 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-sky-600" />
              <p>Gerando relatório…</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center h-72 justify-center">
              <Check className="text-green-600" style={{ width: iconSize }} />
              <p className="mt-4 font-bold">Relatório gerado com sucesso!</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center h-72 justify-center">
              <X className="text-red-600" style={{ width: iconSize }} />
              <p className="mt-4 font-bold">Erro ao gerar relatório</p>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
