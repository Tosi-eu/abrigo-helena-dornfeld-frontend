import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, Stethoscope, Check, X, Loader2, User } from "lucide-react";
import { createStockPDF } from "./StockReporter";
import { pdf } from "@react-pdf/renderer";
import { getReport } from "@/api/requests";

type StatusType = "idle" | "loading" | "success" | "error";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
  const [status, setStatus] = useState<StatusType>("idle");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const reportOptions = [
    { value: "insumos", label: "Insumos", icon: Package },
    { value: "medicamentos", label: "Medicamentos", icon: Stethoscope },
    { value: "residentes", label: "Residentes", icon: User },
    {
      value: "insumos_medicamentos",
      label: "Insumos e Medicamentos",
      icon: Check,
    },
  ];

  const handleSelectReport = (value: string) => setSelectedReports([value]);

  const handleGenerate = async () => {
    if (!selectedReports.length) return;
    setStatus("loading");

    try {
      const tipo = selectedReports[0];

      const res = await getReport(tipo);

      const doc = createStockPDF(tipo, res);
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `relatorio-${tipo}.pdf`;
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
    onClose();
  };

  const iconSize = 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 bg-white rounded-2xl shadow-xl max-w-6xl w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="p-6 w-full flex flex-col items-center"
            >
              <DialogHeader className="w-full relative mb-4">
                <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
                  Gerar Relatório
                </DialogTitle>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3">
                {reportOptions.map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    className={`border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                      selectedReports.includes(value)
                        ? "border-sky-600 bg-sky-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectReport(value)}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        selectedReports.includes(value)
                          ? "text-sky-600"
                          : "text-gray-500"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        selectedReports.includes(value)
                          ? "text-sky-700"
                          : "text-gray-700"
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                ))}

                <div className="mt-6 flex justify-center">
                  <Button
                    className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
                    disabled={selectedReports.length === 0}
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
              transition={{ duration: 0.3 }}
              className="p-10 flex flex-col items-center justify-center gap-3 h-60"
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
              exit={{ opacity: 0 }}
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
              exit={{ opacity: 0 }}
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
