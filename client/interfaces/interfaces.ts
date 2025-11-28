import {
  CabinetCategory,
  MovementType,
  OriginType,
  StockType,
} from "@/enums/enums";
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
  categoria: CabinetCategory | string;
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
  stockType: StockType;
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

export interface StockItem {
  name: string;
  description: string;
  expiry: string;
  quantity: number;
  minimumStock?: number;
  patient?: string;
  cabinet?: number | string;
  casela?: string | number;
  stockType: StockType;
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
    validity: Date
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
