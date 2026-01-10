import { z } from "zod";
import { SectorType, OriginType, ItemStockType } from "@/utils/enums";

export const medicineFormSchema = z
  .object({
    id: z.number({ required_error: "Selecione um medicamento" }),
    quantity: z
      .number({
        required_error: "Quantidade é obrigatória",
        invalid_type_error: "Quantidade deve ser um número",
      })
      .int("Quantidade deve ser um número inteiro")
      .min(1, "Quantidade deve ser maior que zero")
      .max(999999, "Quantidade não pode ser maior que 999.999"),
    stockType: z.nativeEnum(ItemStockType, {
      required_error: "Tipo de estoque é obrigatório",
    }),
    expirationDate: z.date().nullable().optional(),
    casela: z.number().nullable().optional(),
    cabinetId: z.number().nullable().optional(),
    drawerId: z.number().nullable().optional(),
    origin: z.nativeEnum(OriginType).nullable().optional(),
    sector: z.nativeEnum(SectorType, {
      required_error: "Setor é obrigatório",
    }),
    lot: z
      .string()
      .max(100, "Lote não pode ter mais de 100 caracteres")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.stockType === ItemStockType.CARRINHO) {
        return data.drawerId !== null;
      }
      return true;
    },
    {
      message: "Carrinho de emergência requer uma gaveta",
      path: ["drawerId"],
    }
  )
  .refine(
    (data) => {
      if (data.stockType !== ItemStockType.CARRINHO) {
        return data.cabinetId !== null;
      }
      return true;
    },
    {
      message: "Selecione um armário",
      path: ["cabinetId"],
    }
  )
  .refine(
    (data) => {
      if (data.stockType === ItemStockType.GERAL && data.casela !== null) {
        return false;
      }
      return true;
    },
    {
      message: "Estoque geral não pode ter casela",
      path: ["casela"],
    }
  )
  .refine(
    (data) => {
      if (data.cabinetId !== null && data.drawerId !== null) {
        return false;
      }
      return true;
    },
    {
      message: "Não é possível selecionar armário e gaveta ao mesmo tempo",
      path: ["drawerId"],
    }
  );

export type MedicineFormData = z.infer<typeof medicineFormSchema>;

