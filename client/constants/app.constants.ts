export const APP_CONFIG = {
  MAX_CONTAINER_WIDTH: 1651,
  DEFAULT_PAGE_SIZE: 8,
  DEFAULT_PAGINATION_SIZE: 20,
  CACHE_TTL: {
    STOCK: 30,
    DASHBOARD: 60,
  },
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/user/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/user/profile",
  STOCK: "/stock",
  STOCK_IN: "/stock/in",
  STOCK_OUT: "/stock/out",
  STOCK_EDIT: "/stock/edit",
  MEDICINES: "/medicines",
  MEDICINES_REGISTER: "/medicines/register",
  MEDICINES_EDIT: "/medicines/edit",
  INPUTS: "/inputs",
  INPUTS_REGISTER: "/inputs/register",
  INPUTS_EDIT: "/inputs/edit",
  RESIDENTS: "/residents",
  RESIDENTS_REGISTER: "/residents/register",
  RESIDENTS_EDIT: "/residents/edit",
  CABINETS: "/cabinets",
  CABINETS_REGISTER: "/cabinets/register",
  CABINETS_EDIT: "/cabinets/edit",
  DRAWERS: "/drawers",
  DRAWERS_REGISTER: "/drawers/register",
  DRAWERS_EDIT: "/drawers/edit",
  MOVEMENTS: "/movements",
} as const;

export const VALIDATION_LIMITS = {
  EMAIL_MAX_LENGTH: 255,
  FIRST_NAME_MAX_LENGTH: 45,
  LAST_NAME_MAX_LENGTH: 45,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  TEXT_MAX_LENGTH: 255,
  TEXTAREA_MAX_LENGTH: 1000,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 999999,
  LOT_MAX_LENGTH: 100,
} as const;

export const ERROR_MESSAGES = {
  GENERIC: "Ocorreu um erro inesperado. Tente novamente.",
  NETWORK: "Erro de conexão. Verifique sua internet.",
  UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
  NOT_FOUND: "Recurso não encontrado.",
  VALIDATION: "Dados inválidos. Verifique os campos.",
  REQUIRED_FIELD: "Este campo é obrigatório.",
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: "Item criado com sucesso.",
  UPDATED: "Item atualizado com sucesso.",
  DELETED: "Item removido com sucesso.",
  SAVED: "Alterações salvas com sucesso.",
} as const;
