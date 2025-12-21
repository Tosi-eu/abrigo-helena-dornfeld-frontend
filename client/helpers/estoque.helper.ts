import { StockDistributionItem } from "@/interfaces/interfaces";

export type StockSector = "farmacia" | "enfermagem";

export function prepareStockDistributionData(
  proportionRes: any,
  sector: StockSector,
): StockDistributionItem[] {
  const { percentuais, totais } = proportionRes;

  const baseData: StockDistributionItem[] = [
    {
      name: "Medicamentos em Estoque Geral",
      value: percentuais.medicamentos_geral,
      rawValue: totais.medicamentos_geral,
    },
    {
      name: "Medicamentos em Estoque Individual",
      value: percentuais.medicamentos_individual,
      rawValue: totais.medicamentos_individual,
    },
    {
      name: "Insumos em Estoque Geral",
      value: percentuais.insumos,
      rawValue: totais.insumos,
    },
    {
      name: "Medicamentos no Carrinho",
      value: percentuais.carrinho_medicamentos,
      rawValue: totais.carrinho_medicamentos,
    },
    {
      name: "Insumos no Carrinho",
      value: percentuais.carrinho_insumos,
      rawValue: totais.carrinho_insumos,
    },
  ];

  if (sector === "farmacia") {
    return baseData.slice(0, 3);
  }

  return baseData;
}
