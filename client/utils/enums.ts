export enum OperationType {
  MEDICINE = "medicamento",
  INPUT = "insumo",
}

export enum OriginType {
  FAMILIA = "Família",
  AUTOCUSTO = "Autocusto",
  UBS = "UBS",
  FARMACIA_POPULAR = "Farmácia Popular",
  COMPRA_DOACAO = "Compra/Doação",
}

export enum StockCategory {
  MEDICINE = "Medicamento",
  INPUT = "Insumo",
}

export enum MedicineStockType {
  GERAL = "geral",
  INDIVIDUAL = "individual",
  CARRINHO = "carrinho_emergencia",
}

export enum InputStockType {
  GERAL = "geral",
  CARRINHO = "carrinho_emergencia",
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
}

export enum StockWizardSteps {
  TIPO = "tipo",
  ITENS = "itens",
  QUANTIDADE = "quantidade",
}

export enum EventStatus {
  PENDENTE = "pending",
  ENVIADO = "sent",
  CANCELADO = "cancelled",
}

export enum SectorType {
  FARMACIA = "farmacia",
  ENFERMAGEM = "enfermagem",
}
