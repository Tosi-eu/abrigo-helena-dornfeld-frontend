import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  PauseCircle,
  PlayCircle,
  UserMinus,
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
import { ArrowLeftRight } from "lucide-react";

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

const StatusBadge = ({ row }: { row: any }) => {
  if (!row.status) return "-";

  if (row.status === "suspended") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 cursor-default">
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
  onNextPage,
  onPrevPage,
  onRemoveIndividual,
  onTransferSector,
  onSuspend,
  onResume,
}: EditableTableProps & {
  entityType?: string;
  showAddons?: boolean;
  currentPage?: number;
  hasNextPage?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onRemoveIndividual?: (row: any) => void;
  onTransferSector?: (row: any) => void;
  onSuspend?: (row: any) => void;
  onResume?: (row: any) => void;
}) {
  const [rows, setRows] = useState(data);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setRows(data);
  }, [data]);

  const isIndividualMedicine = (row: any) =>
    row.casela !== "-" && row.stockType?.includes("individual");

  const isActive = (row: any) => row.status === "active";

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

    if (
      ["inputs", "medicines", "residents", "cabinets", "drawers"].includes(
        entityType,
      )
    ) {
      type = entityType;
    }

    if (!type) return;

    navigate(`/${type}/edit`, { state: { item: row } });
  };

  const confirmDelete = (index: number) => setDeleteIndex(index);

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

      <div className="overflow-x-auto">
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

          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b transition ${
                  row.status === "suspended"
                    ? "bg-slate-50 opacity-70"
                    : "hover:bg-sky-50"
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-center">
                    {col.key === "status" ? (
                      <StatusBadge row={row} />
                    ) : col.key === "expiry" ? (
                      renderExpiryTag(row)
                    ) : col.key === "quantity" ? (
                      renderQuantityTag(row)
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}

                {showAddons && (
                  <td className="px-4 py-3 flex justify-center gap-4">
                    <button
                      onClick={() => handleEditClick(row)}
                      className="text-sky-700 hover:text-sky-900"
                      title="Editar item"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => confirmDelete(i)}
                      className="text-red-600 hover:text-red-800"
                      title="Deletar item"
                    >
                      <Trash2 size={18} />
                    </button>

                    <button
                      onClick={() => onRemoveIndividual?.(row)}
                      disabled={!isIndividualMedicine(row)}
                      className={`text-orange-600 ${
                        !isIndividualMedicine(row) && disabledActionClass
                      }`}
                      title="Remoção de medicamento individual"
                    >
                      <UserMinus size={18} />
                    </button>

                    <button
                      onClick={() =>
                        isActive(row) ? onSuspend?.(row) : onResume?.(row)
                      }
                      disabled={!isIndividualMedicine(row)}
                      className={`${
                        isActive(row) ? "text-yellow-600" : "text-green-600"
                      } ${!isIndividualMedicine(row) && disabledActionClass}`}
                      title="Suspender Medicação"
                    >
                      {isActive(row) ? (
                        <PauseCircle size={18} />
                      ) : (
                        <PlayCircle size={18} />
                      )}
                    </button>

                    {entityType === "stock" && onTransferSector && (
                      <button
                        onClick={() => onTransferSector(row)}
                        disabled={!isIndividualMedicine(row)}
                        className={`text-indigo-600 hover:text-indigo-800 ${
                          !isIndividualMedicine(row) && disabledActionClass
                        }`}
                        title="Transferir setor"
                      >
                        <ArrowLeftRight size={18} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(onNextPage || onPrevPage) && (
        <div className="flex justify-center gap-4 py-4 border-t bg-white">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            Anterior
          </button>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`px-4 py-2 rounded-lg font-medium border ${
              !hasNextPage
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
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

const renderExpiryTag = (row: any) => {
  if (!row.expirationStatus) return "-";

  const map: Record<string, string> = {
    expired: "bg-red-50 text-red-700 border-red-200",
    critical: "bg-orange-50 text-orange-700 border-orange-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    healthy: "bg-green-50 text-green-700 border-green-200",
  };

  const classes =
    map[row.expirationStatus] ??
    "bg-slate-50 text-slate-700 border border-slate-200";

  const badge = (
    <span className={`px-2 py-1 rounded-full text-xs border ${classes}`}>
      {row.expiry}
    </span>
  );

  if (!row.expirationMsg) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>{row.expirationMsg}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const renderQuantityTag = (row: any) => {
  if (!row.quantityStatus) return row.quantity;

  const map: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    low: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    normal: "bg-green-100 text-green-700",
    high: "bg-green-100 text-green-700",
  };

  const classes =
    map[row.quantityStatus] ??
    "bg-slate-100 text-slate-700 border border-slate-200";

  const badge = (
    <span className={`px-2 py-1 rounded-full text-xs ${classes}`}>
      {row.quantity}
    </span>
  );

  if (!row.quantityMsg) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>{row.quantityMsg}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
