import { StockItem } from "@/interfaces/interfaces";
import { StockActionType } from "@/interfaces/types";

export const actionMessages = {
  remove: {
    success: "Medicamento removido do paciente com sucesso.",
    error: "Erro ao remover medicamento do paciente.",
  },
  suspend: {
    success: "Medicamento suspenso com sucesso.",
    error: "Erro ao suspender medicamento.",
  },
  resume: {
    success: "Medicamento reativado com sucesso.",
    error: "Erro ao reativar medicamento.",
  },
  transfer: (row: StockItem) => {
    const from = row.sector === "farmacia" ? "Farmácia" : "Enfermagem";
    const to = row.sector === "farmacia" ? "Enfermagem" : "Farmácia";

    return {
      success: `Item transferido da ${from} para ${to} com sucesso.`,
      error: `Erro ao transferir item da ${from} para ${to}.`,
    };
  },
};

export const actionTitles: Record<StockActionType, string> = {
  remove: "Remover medicamento do paciente",
  suspend: "Suspender medicamento",
  resume: "Reativar medicamento",
  transfer: "Transferir item de setor",
};

export const actionConfig: Record<
  StockActionType,
  {
    title: string;
    description: (row?: StockItem | null) => string;
  }
> = {
  remove: {
    title: "Remover medicamento do paciente",
    description: () =>
      "O medicamento será desvinculado do paciente e retornará ao estoque geral. Deseja continuar?",
  },

  suspend: {
    title: "Suspender medicamento",
    description: () =>
      "O medicamento ficará suspenso e não poderá ser utilizado. Deseja continuar?",
  },

  resume: {
    title: "Reativar medicamento",
    description: () =>
      "O medicamento será reativado e poderá ser utilizado novamente. Deseja continuar?",
  },

  transfer: {
    title: "Transferir item de setor",
    description: (row) => {
      const from = row?.sector === "farmacia" ? "Farmácia" : "Enfermagem";
      const to = row?.sector === "farmacia" ? "Enfermagem" : "Farmácia";

      return `O item será transferido do setor ${from} para ${to}. Deseja continuar?`;
    },
  },
};
