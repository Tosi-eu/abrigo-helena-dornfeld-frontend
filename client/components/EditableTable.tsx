import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditableTableProps } from "@/interfaces/interfaces";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DeletePopUp from "./DeletePopUp";

import {
  deleteCabinet,
  deleteInput,
  deleteMedicine,
  deleteResident,
} from "@/api/requests";

const typeMap: Record<string, string> = {
  Medicamento: "medicines",
  Insumo: "inputs",
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
}: EditableTableProps & {
  entityType?: string;
  showAddons?: boolean;
  currentPage?: number;
  hasNextPage?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}) {
  const [rows, setRows] = useState(data);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;
    setRows(data);
  }, [data]);

  const handleAddRow = () => {
    if (entityType === "entries") {
      navigate("/stock/in", { state: { previousData: rows } });
    } else if (entityType === "exits") {
      navigate("/stock/out", { state: { previousData: rows } });
    } else if (entityType === "medicines") {
      navigate("/medicines/register");
    } else if (entityType === "residents") {
      navigate("/residents/register");
    } else if (entityType === "inputs") {
      navigate("/inputs/register");
    } else if (entityType === "cabinets") {
      navigate("/cabinets/register");
    }
  };

  const handleEditClick = (row: any) => {
    let type = typeMap[row?.type];
    if (["inputs", "medicines", "residents", "cabinets"].includes(entityType)) {
      type = entityType;
    }

    if (!type) {
      toast({
        title: "Tipo indefinido",
        description: "Nenhum tipo foi informado.",
        variant: "error",
      });
      return;
    }

    navigate(`/${type}/edit`, { state: { item: row } });
  };

  const confirmDelete = async (index: number) => {
    setDeleteIndex(index);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteIndex === null) return;

    const rowToDelete = rows[deleteIndex];
    if (!rowToDelete) return;

    try {
      let res = null;

      if (entityType === "cabinets") {
        res = await deleteCabinet(rowToDelete.numero);
      } else if (entityType === "inputs") {
        res = await deleteInput(rowToDelete.id);
      } else if (entityType === "medicines") {
        res = await deleteMedicine(rowToDelete.id);
      } else if (entityType === "residents") {
        res = await deleteResident(rowToDelete.casela);
      } else {
        throw new Error("Entidade não suportada para deleção.");
      }

      toast({
        title: "Item removido",
        description: res.message ?? "O item foi excluído com sucesso.",
        variant: "success",
      });

      setRows(rows.filter((_, i) => i !== deleteIndex));
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "error",
      });
    } finally {
      setDeleteIndex(null);
    }
  };

  const handleDeleteCancel = () => setDeleteIndex(null);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-[Inter]">
        {/* Header */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-slate-200 bg-sky-50 text-sm">
          {showAddons && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 text-sky-700 text-sm font-medium hover:text-sky-800 transition"
            >
              <Plus size={16} /> Adicionar linha
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-sky-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    {col.label}
                  </th>
                ))}
                {showAddons && (
                  <th className="px-4 py-3 text-sm font-semibold text-slate-800">
                    Ações
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-200 hover:bg-sky-50 transition-colors"
                >
                  {columns.map((col) => {
                    let cellContent = row[col.key];

                    if (col.key === "expiry") cellContent = renderExpiryTag(row);
                    if (col.key === "quantity") cellContent = renderQuantityTag(row);

                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-xs text-slate-800"
                      >
                        {cellContent}
                      </td>
                    );
                  })}

                  {showAddons && (
                    <td className="px-3 py-2 flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-sky-700 hover:text-sky-900 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => confirmDelete(i)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center py-4 text-sm text-slate-600"
                  >
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>

      <DeletePopUp
        open={deleteIndex !== null}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirmed}
        message="Tem certeza que deseja remover este item?"
      />
    </>
  );
}

/* ==== Tags de Status ==== */

const renderExpiryTag = (row: any) => {
  const status = row.expirationStatus;
  const message = row.expirationMsg;

  if (!status) return "-";

  const colorMap: Record<string, string> = {
    expired: "bg-red-100 text-red-700 border border-red-300",
    critical: "bg-orange-100 text-orange-700 border border-orange-300",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    healthy: "bg-green-100 text-green-700 border border-green-300",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium cursor-default ${colorMap[status]}`}
          >
            {row.expiry}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const renderQuantityTag = (row: any) => {
  const status = row.quantityStatus;
  const message = row.quantityMsg;

  const colorMap: Record<string, string> = {
    empty: "bg-red-100 text-red-700 border border-red-300",
    low: "bg-red-100 text-red-700 border border-red-300",
    medium: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    high: "bg-green-100 text-green-700 border border-green-300",
    normal: "bg-green-100 text-green-700 border border-green-300",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium cursor-default ${colorMap[status]}`}
          >
            {row.quantity}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
