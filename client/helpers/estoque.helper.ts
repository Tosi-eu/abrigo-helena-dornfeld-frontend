import { StockDistributionItem } from "@/interfaces/interfaces";
import { SectorType } from "@/utils/enums";

export function prepareStockDistributionData(
  proportionRes: any,
  sector: SectorType,
): StockDistributionItem[] {
  const { percentuais, totais } = proportionRes;

  if (sector === SectorType.FARMACIA) {
    return [
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
    ];
  }

  return [
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
    {
      name: "Medicamentos em Caselas",
      value: percentuais.medicamentos_individual,
      rawValue: totais.medicamentos_individual,
    },
  ];
}
