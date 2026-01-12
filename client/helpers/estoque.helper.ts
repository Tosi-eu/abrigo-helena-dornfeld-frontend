import { StockDistributionItem } from "@/interfaces/interfaces";
import { SectorType } from "@/utils/enums";

export function prepareStockDistributionData(
  proportionRes: any,
  sector: SectorType,
): StockDistributionItem[] {
  const data = proportionRes?.data || proportionRes;
  const { percentuais, totais } = data || {};
  
  if (!percentuais || !totais) {
    return [];
  }

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

  const items: StockDistributionItem[] = [];

  items.push({
    name: "Medicamentos em Estoque Geral",
    value: percentuais.medicamentos_geral || 0,
    rawValue: totais.medicamentos_geral || 0,
  });

  items.push({
    name: "Medicamentos em Caselas",
    value: percentuais.medicamentos_individual || 0,
    rawValue: totais.medicamentos_individual || 0,
  });

  items.push({
    name: "Insumos em Estoque Geral",
    value: percentuais.insumos || 0,
    rawValue: totais.insumos || 0,
  });

  items.push({
    name: "Medicamentos no Carrinho",
    value: percentuais.carrinho_medicamentos || 0,
    rawValue: totais.carrinho_medicamentos || 0,
  });

  items.push({
    name: "Insumos no Carrinho",
    value: percentuais.carrinho_insumos || 0,
    rawValue: totais.carrinho_insumos || 0,
  });

  return items.filter(item => item.value > 0 || item.rawValue > 0);
}
