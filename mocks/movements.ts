import { MovementType } from "@/enums/enums";
import { Movement } from "@/interfaces/interfaces";
import { users } from "../mocks/users";

export const movements: Movement[] = [
  {
    id: 1,
    type: MovementType.IN,
    date: "2025-10-11",
    user: users[0].email,
    medicineId: 1,
    cabinetId: 1,
    patientId: 1,
  },
  {
    id: 2,
    type: MovementType.OUT,
    date: "2025-10-10",
    user: users[0].email,
    medicineId: 3,
    cabinetId: 2,
    patientId: 2,
  },
  {
    id: 3,
    type: MovementType.IN,
    date: "2025-10-09",
    user: users[0].email,
    medicineId: 2,
    cabinetId: 4,
    patientId: 3,
  },
  {
    id: 4,
    type: MovementType.OUT,
    date: "2025-10-08",
    user: users[1].email,
    inputId: 4,
    cabinetId: 1,
  },
  {
    id: 5,
    type: MovementType.IN,
    date: "2025-10-07",
    user: users[1].email,
    inputId: 1,
    cabinetId: 3,
  },
];
