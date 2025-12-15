import {
  MedicineStockType,
  MovementType,
  OperationType,
  OriginType,
} from "@/utils/enums";
import { ReactNode } from "react";

export interface Column {
  key: string;
  label: string;
  editable?: boolean;
  type?: "text" | "date";
  enum?: string[];
}

export interface EditableTableProps {
  data: Record<string, any>[];
  columns: Column[];
  entityType?: string;
  showAddons?: boolean;
  onAdd?: (newRow: Record<string, any>) => void;
  onEdit?: (updatedRow: Record<string, any>, index: number) => void;
  onDelete?: (index: number) => void;
}

export interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export interface DeletePopUpProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message?: string;
}

export interface User {
  email: string;
  password: string;
}

export interface LoggedUser {
  id: number;
  login: string;
}

export interface AuthContextType {
  user: LoggedUser | null;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Patient {
  casela: number;
  name: string;
}

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  measurementUnit: string;
  substance: string;
  minimumStock: number;
}

export interface Cabinet {
  numero: number;
  categoria: string;
}

export interface CabinetCategory {
  id: number;
  nome: string;
}

export interface Input {
  id: number;
  name: string;
  description?: string;
}

export interface MedicineInventory {
  id: number;
  medicineId?: number;
  residentId?: number;
  cabinetId: number;
  quantity: number;
  expiry: string;
  origin: OriginType;
  stockType: MedicineStockType;
}

export interface InputInventory {
  id: number;
  inputId: number;
  cabinetId: number;
  quantity: number;
}

export interface Movement {
  id: number;
  type: MovementType;
  date: string;
  user: string;
  medicineId?: number;
  inputId?: number;
  cabinetId: number;
  patientId?: number;
}

export interface InputMovementRow {
  inputName: string;
  description: string;
  quantity?: number;
  cabinet: string;
  operator?: string;
  movementDate: string;
  movementType: string;
}

export interface MovementRow {
  type: "Medicamento" | "Insumo";
  name: string;
  description: string;
  expiry?: string;
  quantity?: number;
  minimumStock?: number;
  stockType?: string;
  patient?: string;
  casela?: number;
  cabinet?: number | string;
  operator?: string;
  movementDate: string;
  movementType: string;
  originSector?: string;
  destinationSector?: string;
}

export interface PrepareMovementsParams {
  movements: Movement[];
  medicines: Medicine[];
  inputs: Input[];
  patients: Patient[];
  cabinets: Cabinet[];
  users: User[];
  medicineInventory: MedicineInventory[];
  inputInventory: InputInventory[];
}

export interface StockItemRaw {
  item_id: number;
  estoque_id: number;
  tipo_item: OperationType | string;
  nome: string;
  principio_ativo?: string;
  validade?: string | null;
  quantidade: number;
  minimo?: number;
  origem?: string;
  tipo?: string;
  paciente?: string | null;
  armario_id?: number | null;
  casela_id?: number | null;
  detalhes?: string;
}

export interface StockItem {
  name: string;
  description: string;
  expiry: string;
  quantity: number;
  minimumStock?: number;
  patient?: string;
  cabinet?: number | string;
  casela?: string | number;
  stockType: MedicineStockType;
}

export interface StockOutFormProps {
  items: {
    id: string;
    nome: string;
    detalhes?: string;
  }[];
  cabinets: {
    value: string;
    label: string;
  }[];
  onSubmit: (data: {
    itemId: string;
    armarioId: string;
    caselaId?: string;
    quantity: number;
  }) => void;
}

export interface InputFormProps {
  inputs: Input[];
  cabinets: Cabinet[];
  onSubmit: (data: {
    inputId: number;
    cabinetId: number;
    caselaId?: number;
    quantity: number;
    validity: Date;
    stockType: string;
  }) => void;
}

export interface MedicineFormProps {
  medicines: Medicine[];
  caselas: Patient[];
  cabinets: Cabinet[];
  onSubmit: (data: {
    id: number;
    quantity: number;
    cabinet: number;
    casela?: number;
    expirationDate?: Date;
    origin?: string;
    stockType: string;
  }) => void;
}

export interface LoadingModalProps {
  open: boolean;
  title?: string;
  description?: string;
}

export interface RecentMovement {
  name: string;
  type: string;
  operator: string;
  casela: string | number;
  quantity: number;
  patient: string;
  cabinet: string | number;
  date: string;
}

export interface StockStatusItem {
  id: number;
  name: string;
  quantity: number;
  expiry: string | null;
  st_quantidade: "low" | "ok" | "zero";
  st_expiracao: "expired" | "warning" | "critical" | "ok";
  minimo?: number;
  paciente?: string | null;
  armario_id?: number | null;
  casela_id?: number | null;
}

export interface StockDistributionItem {
  name: string;
  value: number;
  rawValue: number;
}

export interface CabinetStockItem {
  cabinet: number;
  total: number;
}

export interface MedicineRankingItem {
  name: string;
  substance: string;
  total: number;
  entradas: number;
  saidas: number;
}

export interface RawMedicineMovement {
  tipo: string;
  quantidade: number;
  data: string;
  MedicamentoModel?: { nome: string };
  LoginModel?: { login: string };
  ResidenteModel?: { nome: string; num_casela: number };
  ArmarioModel?: { num_armario: number };
}

export interface RawMovement {
  tipo: string;
  quantidade: number;
  data: string;

  MedicineModel?: {
    nome: string;
  };

  InputModel?: {
    nome: string;
  };

  LoginModel?: {
    login: string;
  };

  ResidentModel?: {
    nome: string;
    num_casela: number;
  };

  CabinetModel?: {
    num_armario: number;
  };
}
