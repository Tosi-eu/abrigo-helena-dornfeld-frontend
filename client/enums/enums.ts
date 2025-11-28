export enum OperationType {
  MEDICINE = "medicamento",
  INPUT = "insumo",
}

export enum OriginType {
  FAMILIA = "Família",
  AUTOCUSTO = "Autocusto",
  UBS = "UBS",
  FARMACIA_POPULAR = "Farmácia Popular",
  COMPRA_DOACAO = "Compra/Doação"
}

export enum CabinetCategory {
  MEDICACAO_GERAL = "Medicação geral",
  PSICOTROPICOS_E_INJECOES = "Psicotrópicos e injeções",
  MEDICAMENTOS_DOADOS = "Medicamentos doados / Fitas / Dersane / Clorexidina",
  DIVERSOS = "Lactulose / Hipratrópio / Pomadas / Domperidona / Materiais de glicemia",
}

export enum StockCategory {
  MEDICINE = "Medicamento",
  INPUT = "Insumo",
}

export enum StockType {
  GERAL = "geral",
  INDIVIDUAL = "individual",
  CARRINHO = "carrinho_emergencia"
}

export enum TransactionType {
  COMPRA = "Compra",
  DOACAO = "Doação",
  REPOSICAO = "Reposição",
}

export enum MovementType {
  IN = "entrada",
  OUT = "saida",
}

export enum StockTypeLabels {
  geral = "Estoque geral",
  individual = "Estoque individual",
  carrinho_emergencia = "Carrinho de emergência",
};

