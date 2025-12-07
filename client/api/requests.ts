
import { EventStatus, MovementType, OperationType } from "@/utils/enums";
import { api } from "./canonical";

export const getCabinets = () => api.get("/armarios");

export const checkCabinetStock = (number: number) =>
  api.get(`/armarios/${number}/check`);

export const deleteCabinet = (number: number, destiny?: any) =>
  api.delete(`/armarios/${number}`, destiny);

export const getMedicines = (page = 1, limit = 10) =>
  api.get("/medicamentos", {
    params: { page, limit },
  });

export const deleteMedicine = (id: number) => api.delete(`/medicamentos/${id}`);

export const getInputMovements = ({ page = 1, limit = 10, days = 0 }: {
  page?: number;
  limit?: number;
  days?: number;
}) =>
  api.get("/movimentacoes/insumos", {
    params: { page, limit, days },
  });

export const getMedicineMovements = ({ page = 1, limit = 10, days = 0, type }: {
  page?: number;
  limit?: number;
  days?: number;
  type?: string;
}) =>
  api.get("/movimentacoes/medicamentos", {
    params: { page, limit, days, type },
  });

export const getInputs = (page = 1, limit = 10) =>
  api.get(`/insumos?page=${page}&limit=${limit}`);

export const deleteInput = (id: number) => api.delete(`/insumos/${id}`);

export const getResidents = (page = 1, limit = 20) =>
  api.get("/residentes", { params: { page, limit } });

export const deleteResident = (casela: string | number) =>
  api.delete(`/residentes/${casela}`);

export const getReport = (type: string) => api.get(`/relatorios?type=${type}`);

export const login = (login: string, password: string) =>
  api.post("/login/authenticate", { login, password });

export const register = (login: string, password: string) =>
  api.post("/login", { login, password });

export const updateInput = (id: number, data: any) =>
  api.put(`/insumos/${id}`, data);

export const updateCabinet = (id: number, data: any) =>
  api.put(`/armarios/${id}`, data);

export const updateMedicine = (id: number, data: any) =>
  api.put(`/medicamentos/${id}`, data);

export const resetPassword = (email: string, newPassword: string) =>
  api.put(`/login/reset-password`, { email, newPassword });

export const updateResident = (casela: string | number, data: any) =>
  api.put(`/residentes/${casela}`, data);

export const updateUser = (
  userId: number,
  payload: {
    login: string;
    password: string;
    currentLogin: string;
    currentPassword: string;
  },
) => api.put(`/login/${userId}`, payload);

export const createCabinet = (numero: number, categoria_id: number) =>
  api.post("/armarios", { numero, categoria_id });

export const createInput = (nome: string, descricao?: string, estoque_minimo?: number) =>
  api.post("/insumos", { nome, descricao: descricao ?? null, estoque_minimo: estoque_minimo ?? 0 });

export const createMedicine = (
  nome: string,
  principio_ativo: string,
  dosagem: string,
  unidade_medida: string,
  estoque_minimo?: number,
) =>
  api.post("/medicamentos", {
    nome,
    principio_ativo,
    dosagem,
    unidade_medida,
    estoque_minimo: Number(estoque_minimo) ?? null,
  });

export const createResident = (nome: string, casela: string) =>
  api.post("/residentes", { nome, casela: parseInt(casela) });

export const createStockOut = (payload: {
  estoqueId: number;
  tipo: OperationType;
  quantidade: number;
}) => api.post("/estoque/saida", payload);

export const createStockIn = (payload: {
  tipo: string;
  medicamento_id?: number;
  insumo_id?: number;
  quantidade: number;
  armario_id: number;
  casela_id?: number | null;
  validade?: Date | null;
  origem?: string | null;
}) => api.post("/estoque/entrada", payload);

export const createMovement = (payload: {
  tipo: MovementType;
  login_id: number;
  armario_id: number;
  quantidade: number;
  casela_id?: number;
  medicamento_id?: number;
  validade: string;
  insumo_id?: number;
}) => api.post("/movimentacoes", payload);

export const createNotificationEvent = (payload: {
    medicamento_id: number,
    residente_id: number,
    destino: string,
    data_prevista: Date,
    criado_por: number,
    status: EventStatus
}) => api.post("/notificacao", payload);

export const getNotifications = async (page = 1, limit = 10, status?: string) => {
  try {
    const res = await api.get("/notificacao", { params: { page, limit, status } });
    const data = res.data;

    return {
      items: Array.isArray(data) ? data : [], 
      total: typeof data.total === "number" ? data.total : 0,
    };
  } catch (err) {
    console.error("Erro ao buscar notificações:", err);
    return { items: [], total: 0 };
  }
}
export const updateNotification = (id: number, data: { status: string }) =>
  api.patch(`/notificacao/${id}`, data);

export const patchNotificationEvent = (id: number, data: Partial<{
  medicamento_id: number;
  residente_id: number;
  destino: string;
  data_prevista: Date;
  criado_por: number;
  status: EventStatus;
}>) => api.patch(`/notificacao/${id}`, data);

export const getStock = (page = 1, limit = 6, type?: string) =>
  api.get(`/estoque?page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`);

export const getCabinetCategories = (page = 1, limit = 5) =>
  api.get("/categoria-armario", {
    params: { page, limit },
  });

export const createCabinetCategory = (nome: string) =>
  api.post("/categoria-armario", { nome });

export const getMedicineRanking = (type: "more" | "less", page = 1, limit = 10) =>
  api.get("/movimentacoes/medicamentos/ranking", {
    params: { type, page, limit },
  });