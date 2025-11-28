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
  getCabinets,
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
}: EditableTableProps & { entityType?: string; showAddons?: boolean }) {
  const [rows, setRows] = useState(data);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;

    const convertToBRT = (dateString: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Sao_Paulo",
      });
    };

    const formatted = data.map((row) => {
      const updatedRow: Record<string, any> = {};
      for (const key in row) {
        const value = row[key];
        if (
          typeof value === "string" &&
          (/^\d{4}-\d{2}-\d{2}/.test(value) ||
            /^\d{4}\/\d{2}\/\d{2}/.test(value))
        ) {
          updatedRow[key] = convertToBRT(value);
        } else {
          updatedRow[key] = value;
        }
      }
      return updatedRow;
    });

    setRows(formatted);
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
    setDeleteIndex(index); // Delete puro agora
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

  const rowsFiltered = rows;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const pageRows = rowsFiltered.slice(startIndex, endIndex);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-[Inter]">
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
              {pageRows.map((row, i) => {
                const absoluteIndex = startIndex + i;

                return (
                  <tr
                    key={absoluteIndex}
                    className="border-b border-slate-200 hover:bg-sky-50 transition-colors"
                  >
                    {columns.map((col) => {
                      let cellContent = row[col.key];

                      if (col.key === "expiry") {
                        cellContent = renderExpiryTag(row[col.key]);
                      } else if (col.key === "quantity") {
                        cellContent = renderQuantityTag(row);
                      }

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
                          onClick={() => confirmDelete(absoluteIndex)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {rowsFiltered.length === 0 && (
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

const renderExpiryTag = (value: string) => {
  if (!value) return "-";

  const [day, month, year] = value.split("/").map(Number);
  const expiryDate = new Date(year, month - 1, day);
  if (isNaN(expiryDate.getTime())) return value;

  const today = new Date();
  const diffDays = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let tooltipText = "";
  let colorClasses = "";

  if (diffDays < 0) {
    tooltipText = `Vencido há ${Math.abs(diffDays)} dias`;
    colorClasses = "bg-red-100 text-red-700 border border-red-300";
  } else if (diffDays <= 30) {
    tooltipText = `Vencerá em ${diffDays} dias`;
    colorClasses = "bg-orange-100 text-orange-700 border border-orange-300";
  } else if (diffDays <= 60) {
    tooltipText = `Vencerá em ${diffDays} dias`;
    colorClasses = "bg-yellow-100 text-yellow-700 border border-yellow-300";
  } else {
    tooltipText = `Vencerá em ${diffDays} dias`;
    colorClasses = "bg-green-100 text-green-700 border border-green-300";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium cursor-default ${colorClasses}`}
          >
            {value}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const renderQuantityTag = (row: any) => {
  let colorClasses = "";
  let tooltipText = "";

  if (row.minimumStock != null) {
    const margin = row.minimumStock * 0.2;

    if (row.quantity > row.minimumStock * 2) {
      colorClasses = "bg-green-100 text-green-700 border border-green-300";
      tooltipText = `Estoque saudável: ${row.quantity} unidades, mínimo ${row.minimumStock}`;
    } else if (row.quantity > row.minimumStock + margin) {
      colorClasses = "bg-yellow-100 text-yellow-700 border border-yellow-300";
      tooltipText = `Estoque médio: ${row.quantity} unidades, mínimo ${row.minimumStock}`;
    } else {
      colorClasses = "bg-red-100 text-red-700 border border-red-300";
      tooltipText = `Estoque baixo: ${row.quantity} unidades, mínimo ${row.minimumStock}`;
    }
  } else {
    colorClasses = "bg-green-100 text-green-700 border border-green-300";
    tooltipText = `Quantidade: ${row.quantity}`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium cursor-default ${colorClasses}`}
          >
            {row.quantity}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};