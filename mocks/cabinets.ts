import { CabinetCategory } from "@/enums/enums";
import { Cabinet } from "@/interfaces/interfaces";

export const cabinets: Cabinet[] = [
  {
    id: 1,
    category: CabinetCategory.PSICOTROPICOS_E_INJECOES,
  },
  {
    id: 2,
    category: CabinetCategory.MEDICAMENTOS_DOADOS,
  },
  {
    id: 3,
    category: CabinetCategory.DIVERSOS,
  },
  {
    id: 4,
    category: CabinetCategory.MEDICACAO_GERAL,
  },
  {
    id: 5,
    category: CabinetCategory.DIVERSOS,
  },
];
