import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
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

import {
  deleteCabinet,
  deleteDrawer,
  deleteInput,
  deleteMedicine,
  deleteResident,
} from "@/api/requests";
import { PauseCircle, PlayCircle, UserMinus } from "lucide-react";

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

  const isIndividualMedicine = (row: any) => row.casela != "-";
  const isActive = (row: any) => row.status === "active";
  const isSuspended = (row: any) => row.status === "suspended";
  const disabledActionClass =
    "opacity-40 cursor-not-allowed pointer-events-none";

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
    } else if (entityType === "drawers") {
      navigate("/drawer/register");
    }
  };

  const handleRemoveIndividual = (row: any) => {
    // TODO: chamar endpoint de remoção do individual
    toast({
      title: "Medicamento desvinculado",
      description: "O medicamento voltou para o estoque geral.",
      variant: "success",
    });
  };

  const handleSuspend = (row: any) => {
    // TODO: chamar endpoint de suspensão
    toast({
      title: "Medicamento suspenso",
      variant: "success",
    });
  };

  const handleResume = (row: any) => {
    // TODO: chamar endpoint de reativação
    toast({
      title: "Medicamento reativado",
      variant: "success",
    });
  };

  const handleEditClick = (row: any) => {
    let type = typeMap[row?.type];
    if (
      ["inputs", "medicines", "residents", "cabinets", "drawers"].includes(
        entityType,
      )
    ) {
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
      } else if (entityType === "drawers") {
        res = await deleteDrawer(rowToDelete.numero);
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
        description: "O item foi excluído com sucesso.",
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
        <div className="flex items-center justify-end px-4 py-3 border-b border-slate-200 bg-sky-50">
          {showAddons && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-sky-700 hover:text-sky-800 hover:bg-sky-100 rounded-lg transition"
            >
              <Plus size={16} /> Adicionar
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-100 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-center text-sm font-semibold text-slate-800"
                  >
                    {col.label}
                  </th>
                ))}
                {showAddons && (
                  <th className="px-4 py-3 text-sm font-semibold text-slate-800 text-center">
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
                    let content = row[col.key];
                    if (col.key === "expiry") content = renderExpiryTag(row);
                    if (col.key === "quantity")
                      content = renderQuantityTag(row);

                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-slate-800 text-center"
                      >
                        {content}
                      </td>
                    );
                  })}

                  {showAddons && (
                    <td className="px-4 py-3 flex justify-center gap-4">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-sky-700 hover:text-sky-900 transition"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => confirmDelete(i)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleRemoveIndividual(row)}
                              disabled={!isIndividualMedicine(row)}
                              className={`text-orange-600 hover:text-orange-800 transition ${
                                !isIndividualMedicine(row)
                                  ? disabledActionClass
                                  : ""
                              }`}
                            >
                              <UserMinus size={18} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isIndividualMedicine(row)
                              ? "Remover medicamento do paciente"
                              : "Disponível apenas para medicamentos individuais"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() =>
                                isActive(row)
                                  ? handleSuspend(row)
                                  : handleResume(row)
                              }
                              disabled={!isIndividualMedicine(row)}
                              className={`
                                  transition
                                  ${
                                    !isIndividualMedicine(row)
                                      ? disabledActionClass
                                      : isActive(row)
                                        ? "text-yellow-600 hover:text-yellow-800"
                                        : "text-green-600 hover:text-green-800"
                                  }
                                `}
                            >
                              {isActive(row) ? (
                                <PauseCircle size={18} />
                              ) : (
                                <PlayCircle size={18} />
                              )}
                            </button>
                          </TooltipTrigger>

                          <TooltipContent>
                            {!isIndividualMedicine(row)
                              ? "Disponível apenas para medicamentos individuais"
                              : isActive(row)
                                ? "Suspender medicamento"
                                : "Reativar medicamento"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  )}
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center py-6 text-sm text-slate-600"
                  >
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(onNextPage || onPrevPage) && (
          <div className="flex justify-center gap-4 py-4 bg-white border-t border-slate-200">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium border transition ${
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
              className={`px-4 py-2 rounded-lg font-medium border transition ${
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
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirmed}
          message="Tem certeza que deseja remover este item?"
        />
      </div>
    </>
  );
}

const renderExpiryTag = (row: any) => {
  const status = row.expirationStatus;
  const message = row.expirationMsg;

  if (!status) return "-";

  const colorMap: Record<string, string> = {
    expired: "bg-red-50 text-red-700 border border-red-200",
    critical: "bg-orange-50 text-orange-700 border border-orange-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    healthy: "bg-green-50 text-green-700 border border-green-200",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-medium ${colorMap[status]}`}
          >
            {row.expiry}
          </span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const renderQuantityTag = (row: any) => {
  const status = row.quantityStatus;
  const message = row.quantityMsg;

  const colorMap: Record<string, string> = {
    empty: "bg-red-100 text-red-700 border border-red-300",
    low: "bg-orange-100 text-orange-700 border border-orange-300",
    critical: "bg-red-100 text-red-700 border border-red-300",
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
