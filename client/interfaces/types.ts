export type StockActionType =
  | "remove"
  | "suspend"
  | "resume"
  | "transfer"
  | null;

export type StockExpiryStatus = "expired" | "warning" | "critical" | "ok";

export type StockQuantityStatus = "low" | "ok" | "zero";

export type StockItemType = "medicamento" | "insumo";

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  login?: string;
  password?: string;
  currentPassword: string;
};
