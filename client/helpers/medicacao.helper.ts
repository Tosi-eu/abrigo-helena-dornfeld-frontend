import { Medicine, RawStockMedicine } from "@/interfaces/interfaces";

export function mapRawMedicineToMedicine(raw: RawStockMedicine): Medicine {
  return {
    id: raw.id,
    name: raw.nome,
    dosage: String(raw.dosagem),
    measurementUnit: raw.unidade_medida,
    substance: raw.principio_ativo,
    minimumStock: parseInt(raw.estoque_minimo) ?? 0,
  };
}

export function mapRawMedicines(raws: RawStockMedicine[]): Medicine[] {
  return raws.map(mapRawMedicineToMedicine);
}

export function sanitizeDosage(value: string) {
  return value.replace(/[^0-9,/]/g, "");
}
