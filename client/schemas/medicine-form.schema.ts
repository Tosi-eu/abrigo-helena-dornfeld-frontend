import { z } from "zod";
import { SectorType, OriginType, MedicineStockType } from "@/utils/enums";

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
    stockType: z.nativeEnum(MedicineStockType, {
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
      // Se é carrinho de emergência, deve ter gaveta
      if (data.stockType === MedicineStockType.CARRINHO) {
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
      // Se não é carrinho, deve ter armário
      if (data.stockType !== MedicineStockType.CARRINHO) {
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
      // Estoque geral não pode ter casela
      if (data.stockType === MedicineStockType.GERAL && data.casela !== null) {
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
      // Armário e gaveta não podem ser selecionados ao mesmo tempo
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

