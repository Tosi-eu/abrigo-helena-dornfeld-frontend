import { useState, useEffect, useMemo, useId } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  PauseCircle,
  PlayCircle,
  UserMinus,
  ArrowLeftRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditableTableProps } from "@/interfaces/interfaces";
import { useToast } from "@/hooks/use-toast.hook";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DeletePopUp from "./DeletePopUp";
import { AnimatePresence, motion } from "framer-motion";

import {
  deleteCabinet,
  deleteDrawer,
  deleteInput,
  deleteMedicine,
  deleteResident,
  deleteStockItem,
} from "@/api/requests";

const typeMap: Record<string, string> = {
  Medicamento: "medicines",
  Insumo: "inputs",
};

const tableVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const rowVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const SkeletonCell = () => (
  <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
);

const SkeletonRow = ({ cols }: { cols: number }) => (
  <motion.tr
    variants={rowVariants}
    initial="initial"
    animate="animate"
    className="border-b"
  >
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonCell />
      </td>
    ))}
    <td className="px-4 py-3">
      <div className="flex justify-center gap-3">
        <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
        <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
      </div>
    </td>
  </motion.tr>
);

const StatusBadge = ({ row }: { row: any }) => {
  if (!row?.status) return "-";

  if (row.status === "suspended") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              Suspenso
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {row.suspended_at
              ? `Suspenso em ${row.suspended_at.toLocaleDateString()}`
              : "Medicamento suspenso"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      Ativo
    </span>
  );
};

export default function EditableTable({
  data,
  columns,
  entityType,
  showAddons = true,
  currentPage = 1,
  hasNextPage = false,
  loading = false,
  onNextPage,
  onPrevPage,
  onRemoveIndividual,
  onTransferSector,
  onSuspend,
  onResume,
  minRows = 5,
}: EditableTableProps & {
  entityType?: string;
  showAddons?: boolean;
  currentPage?: number;
  hasNextPage?: boolean;
  minRows?: number;
  loading?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onRemoveIndividual?: (row: any) => void;
  onTransferSector?: (row: any) => void;
  onSuspend?: (row: any) => void;
  onResume?: (row: any) => void;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const instanceId = useId();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setRows(data);
  }, [data]);

  const displayRows = useMemo(() => {
    if (rows.length >= minRows) return rows;

    return [
      ...rows,
      ...Array.from({ length: minRows - rows.length }, () => null),
    ];
  }, [rows, minRows]);

  const isIndividualMedicine = (row: any) =>
    row?.casela !== "-" && row?.stockType?.includes("individual");

  const isActive = (row: any) => row?.status === "active";

  const disabledActionClass =
    "opacity-40 cursor-not-allowed pointer-events-none";

  const handleAddRow = () => {
    const routes: Record<string, string> = {
      entries: "/stock/in",
      exits: "/stock/out",
      medicines: "/medicines/register",
      residents: "/residents/register",
      inputs: "/inputs/register",
      cabinets: "/cabinets/register",
      drawers: "/drawer/register",
    };

    const route = routes[entityType ?? ""];
    if (route) navigate(route);
  };

  const handleEditClick = (row: any) => {
    if (row.status === "suspended") {
      toast({
        title: "Medicamento suspenso",
        description: "Reative o medicamento para poder editá-lo.",
        variant: "error",
      });
      return;
    }

    let type = typeMap[row?.type];
    if (entityType) type = entityType;

    if (!type) return;
    navigate(`/${type}/edit`, { state: { item: row } });
  };

  const handleDeleteConfirmed = async () => {
    if (deleteIndex === null) return;
    const row = rows[deleteIndex];
    if (!row) return;

    try {
      if (entityType === "cabinets") await deleteCabinet(row.numero);
      else if (entityType === "drawers") await deleteDrawer(row.numero);
      else if (entityType === "inputs") await deleteInput(row.id);
      else if (entityType === "medicines") await deleteMedicine(row.id);
      else if (entityType === "residents") await deleteResident(row.casela);
      else if (entityType === "stock")
        await deleteStockItem(row.id, row.itemType);

      toast({ title: "Item removido", variant: "success" });
      setRows((prev) => prev.filter((_, i) => i !== deleteIndex));
    } catch {
      toast({ title: "Erro ao remover item", variant: "error" });
    } finally {
      setDeleteIndex(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-end px-4 py-3 border-b bg-sky-50">
        {showAddons && (
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 rounded-lg"
          >
            <Plus size={16} /> Adicionar
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-100 border-b">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-sm font-semibold">
                  {col.label}
                </th>
              ))}
              {showAddons && <th className="px-4 py-3">Ações</th>}
            </tr>
          </thead>

          <AnimatePresence mode="wait">
            <motion.tbody
              key={`${instanceId}-${loading}-${currentPage}`}
              variants={tableVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {loading
                ? Array.from({ length: minRows }).map((_, i) => (
                    <SkeletonRow key={i} cols={columns.length} />
                  ))
                : displayRows.map((row, i) => (
                    <motion.tr
                      key={i}
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      className={`border-b ${
                        row
                          ? row.status === "suspended"
                            ? "bg-slate-50 opacity-70"
                            : "hover:bg-sky-50"
                          : "bg-white"
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-sm text-center"
                        >
                          {!row ? (
                            "\u00A0"
                          ) : col.key === "status" ? (
                            <StatusBadge row={row} />
                          ) : (
                            row[col.key]
                          )}
                        </td>
                      ))}

                      {showAddons && (
                        <td className="px-4 py-3 flex justify-center gap-4">
                          {row && (
                            <>
                              <button
                                onClick={() => handleEditClick(row)}
                                className="text-sky-700 hover:text-sky-900"
                              >
                                <Pencil size={18} />
                              </button>

                              <button
                                onClick={() => setDeleteIndex(i)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>

                              <button
                                onClick={() => onRemoveIndividual?.(row)}
                                disabled={!isIndividualMedicine(row)}
                                className={`text-orange-600 ${
                                  !isIndividualMedicine(row) &&
                                  disabledActionClass
                                }`}
                              >
                                <UserMinus size={18} />
                              </button>

                              <button
                                onClick={() =>
                                  isActive(row)
                                    ? onSuspend?.(row)
                                    : onResume?.(row)
                                }
                                disabled={!isIndividualMedicine(row)}
                                className={`${
                                  isActive(row)
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                } ${
                                  !isIndividualMedicine(row) &&
                                  disabledActionClass
                                }`}
                              >
                                {isActive(row) ? (
                                  <PauseCircle size={18} />
                                ) : (
                                  <PlayCircle size={18} />
                                )}
                              </button>

                              {entityType === "stock" &&
                                onTransferSector && (
                                  <button
                                    onClick={() => onTransferSector(row)}
                                    className="text-indigo-600 hover:text-indigo-800"
                                  >
                                    <ArrowLeftRight size={18} />
                                  </button>
                                )}
                            </>
                          )}
                        </td>
                      )}
                    </motion.tr>
                  ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {(onNextPage || onPrevPage) && (
        <div className="flex justify-center gap-4 py-4 border-t">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            Anterior
          </button>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`px-4 py-2 rounded-lg border ${
              !hasNextPage
                ? "bg-gray-200 text-gray-500"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            Próximo
          </button>
        </div>
      )}

      <DeletePopUp
        open={deleteIndex !== null}
        onCancel={() => setDeleteIndex(null)}
        onConfirm={handleDeleteConfirmed}
        message="Tem certeza que deseja remover este item?"
      />
    </div>
  );
}
