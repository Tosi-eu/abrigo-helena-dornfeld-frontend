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
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { getReport, getResidents, getTransferReport } from "@/api/requests";
import { fetchAllPaginated } from "@/helpers/paginacao.helper";
import { TransferReport } from "./StockReporter";

type StatusType = "idle" | "loading" | "success" | "error";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

interface Resident {
  casela: number;
  name: string;
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
  const [status, setStatus] = useState<StatusType>("idle");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(false);

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
  ];

  useEffect(() => {
    if (open && selectedReports[0] === "residente_consumo") {
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
    if (value !== "residente_consumo") {
      setSelectedResident(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedReports.length) return;
    
    if (selectedReports[0] === "residente_consumo" && !selectedResident) {
      return;
    }

    setStatus("loading");

    try {
      const tipo = selectedReports[0];
      let data;
      
      if (tipo === "transferencias") {
        const transfers = await getTransferReport();
        console.log(transfers)
        data = transfers.map((item: TransferReport) => ({
          nome: item.nome,
          principio_ativo: item?.principio_ativo || "-",
          quantidade: item.quantidade,
          usuario: item.usuario,
          data: item.data,
          armario: item.armario,
          casela: item.casela,
          residente: item.residente,
        }));
      } else {
        const casela = tipo === "residente_consumo" ? selectedResident : undefined;
        data = await getReport(tipo, casela || undefined);
      }

      const { createStockPDF } = await import("./StockReporter");
      const doc = createStockPDF(tipo, data);

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const casela = tipo === "residente_consumo" ? selectedResident : undefined;
      link.download = `relatorio-${tipo}${casela ? `-casela-${casela}` : ''}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setStatus("success");
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setSelectedReports([]);
    setSelectedResident(null);
    onClose();
  };

  const showResidentSelector = selectedReports[0] === "residente_consumo";

  const iconSize = 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 bg-white rounded-2xl shadow-xl max-w-3xl w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-8 w-full flex flex-col items-center"
            >
              <DialogHeader className="w-full mb-6 text-center">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Gerar Relatório
                </DialogTitle>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3">
                {reportOptions.map(({ value, label, icon: Icon }) => {
                  const isSelected = selectedReports.includes(value);
                  return (
                    <motion.div
                      key={value}
                      whileHover={{ scale: 1.01 }}
                      className={`border-2 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-sky-600 bg-sky-50 shadow-sm"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                      onClick={() => handleSelectReport(value)}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected ? "text-sky-600" : "text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? "text-sky-700" : "text-gray-700"
                        }`}
                      >
                        {label}
                      </p>
                    </motion.div>
                  );
                })}

                {showResidentSelector && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecione o Residente:
                    </label>
                    {loadingResidents ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                        <span className="ml-2 text-sm text-gray-600">
                          Carregando residentes...
                        </span>
                      </div>
                    ) : (
                      <select
                        value={selectedResident || ""}
                        onChange={(e) =>
                          setSelectedResident(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="">Selecione um residente...</option>
                        {residents.map((resident) => (
                          <option key={resident.casela} value={resident.casela}>
                            Casela {resident.casela} - {resident.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}

                <div className="mt-6 flex justify-center">
                  <Button
                    className="
                      px-8 py-2 
                      bg-sky-600 
                      text-white 
                      rounded-lg 
                      hover:bg-sky-700 
                      transition
                      disabled:opacity-50
                    "
                    disabled={
                      selectedReports.length === 0 ||
                      (showResidentSelector && !selectedResident)
                    }
                    onClick={handleGenerate}
                  >
                    Gerar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-12 flex flex-col items-center justify-center gap-4 h-64"
            >
              <Loader2 className="w-12 h-12 animate-spin text-sky-600" />
              <p className="text-gray-600 font-medium text-center">
                Gerando...
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              className="flex flex-col items-center justify-center h-72 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Check
                className="text-green-600"
                style={{ width: iconSize, height: iconSize }}
              />
              <p className="font-bold text-xl text-center mt-4">
                Relatório gerado com sucesso!
              </p>
              <Button
                className="mt-6 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleClose}
              >
                OK
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              className="flex flex-col items-center justify-center h-72 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <X
                className="text-red-600"
                style={{ width: iconSize, height: iconSize }}
              />
              <p className="font-bold text-xl text-center mt-4">
                Falha ao gerar relatório!
              </p>
              <Button
                className="mt-6 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleClose}
              >
                OK
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
