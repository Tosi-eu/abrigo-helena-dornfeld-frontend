import { OriginType, StockType } from "@/enums/enums";
import { InputInventory, MedicineInventory } from "@/interfaces/interfaces";

export const inputInventory: InputInventory[] = [
  { id: 1, inputId: 1, cabinetId: 3, quantity: 500 },
  { id: 2, inputId: 2, cabinetId: 2, quantity: 200 },
  { id: 3, inputId: 3, cabinetId: 2, quantity: 80 },
  { id: 4, inputId: 4, cabinetId: 1, quantity: 120 },
  { id: 5, inputId: 5, cabinetId: 4, quantity: 150 },
];

export const medicineInventory: MedicineInventory[] = [
  {
    id: 1,
    medicineId: 1,
    cabinetId: 1,
    quantity: 60,
    residentId: 1,
    expiry: "2025-11-20",
    origin: OriginType.AUTOCUSTO,
    stockType: StockType.INDIVIDUAL,
  },
  {
    id: 2,
    medicineId: 2,
    cabinetId: 4,
    quantity: 120,
    expiry: "2025-09-10",
    origin: OriginType.AUTOCUSTO,
    stockType: StockType.GERAL,
  },
  {
    id: 3,
    medicineId: 3,
    cabinetId: 2,
    quantity: 80,
    residentId: 2,
    expiry: "2025-08-10",
    origin: OriginType.AUTOCUSTO,
    stockType: StockType.GERAL,
  },
  {
    id: 4,
    medicineId: 3,
    cabinetId: 4,
    quantity: 50,
    expiry: "2025-07-10",
    origin: OriginType.AUTOCUSTO,
    stockType: StockType.INDIVIDUAL,
  },
  {
    id: 5,
    medicineId: 4,
    cabinetId: 4,
    quantity: 30,
    expiry: "2025-06-25",
    origin: OriginType.AUTOCUSTO,
    stockType: StockType.INDIVIDUAL,
  },
];
