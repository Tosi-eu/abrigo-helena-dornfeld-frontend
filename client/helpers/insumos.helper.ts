import { Input, RawStockInput } from "@/interfaces/interfaces";

export function mapRawInputToInput(raw: RawStockInput): Input {
  return {
    id: raw.id,
    name: raw.nome,
    description: raw.descricao || "-",
    minimumStock: raw.estoque_minimo ?? 0,
  };
}

export function mapRawInput(raws: RawStockInput[]): Input[] {
  return raws.map(mapRawInputToInput);
}