import { OperationType } from "@/enums/enums";
import { api } from "./canonical";

export const getCabinets = () => api.get("/armarios");

export const checkCabinetStock = (number: number) =>
  api.get(`/armarios/${number}/check`);

export const deleteCabinet = (number: number, destiny?: any) =>
  api.delete(`/armarios/${number}`, destiny);

export const getMedicines = () => api.get("/medicamentos");

export const deleteMedicine = (id: number) => api.delete(`/medicamentos/${id}`);

export const getInputMovements = () => api.get("/movimentacoes/insumos");

export const getMedicineMovements = () =>
  api.get("/movimentacoes/medicamentos");

export const getInputs = () => api.get("/insumos");

export const deleteInput = (id: number) => api.delete(`/insumos/${id}`);

export const getResidents = () => api.get("/residentes");

export const deleteResident = (casela: string | number) =>
  api.delete(`/residentes/${casela}`);

export const getReport = (type: string) => api.get(`/relatorios?tipo=${type}`);

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

export const createCabinet = (numero: number, categoria: string) =>
  api.post("/armarios", { numero, categoria });

export const createInput = (nome: string, descricao?: string) =>
  api.post("/insumos", { nome, descricao: descricao ?? null });

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
  tipo: "entrada" | "saida";
  login_id: number;
  armario_id: number;
  quantidade: number;
  casela_id?: number;
  medicamento_id?: number;
  validade_medicamento?: string | null;
  insumo_id?: number;
}) => api.post("/movimentacoes", payload);

export const getStock = () => api.get("/estoque");
