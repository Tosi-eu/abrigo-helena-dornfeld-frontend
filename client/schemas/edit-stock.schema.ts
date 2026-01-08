import { z } from "zod";
import { SectorType, OriginType, MedicineStockType, InputStockType } from "@/utils/enums";

const stockTypeSchema = z.union([
  z.literal(MedicineStockType.GERAL),
  z.literal(MedicineStockType.INDIVIDUAL),
  z.literal(MedicineStockType.CARRINHO),
  z.literal(InputStockType.GERAL),
  z.literal(InputStockType.CARRINHO),
]);

export const editStockSchema = z
  .object({
    quantidade: z
      .number({
        required_error: "Quantidade é obrigatória",
        invalid_type_error: "Quantidade deve ser um número",
      })
      .int("Quantidade deve ser um número inteiro")
      .min(1, "Quantidade deve ser maior que zero")
      .max(999999, "Quantidade não pode ser maior que 999.999"),
    armario_id: z.number().nullable().optional(),
    gaveta_id: z.number().nullable().optional(),
    validade: z.date().nullable().optional(),
    origem: z.nativeEnum(OriginType).nullable().optional(),
    setor: z.nativeEnum(SectorType, {
      required_error: "Setor é obrigatório",
      invalid_type_error: "Setor inválido",
    }),
    lote: z
      .string()
      .max(50, "Lote não pode ter mais de 50 caracteres")
      .optional()
      .nullable(),
    casela_id: z.number().nullable().optional(),
    tipo: stockTypeSchema,
  })
  .refine(
    (data) => {
      if (data.gaveta_id !== null) {
        return data.armario_id === null;
      }
      return true;
    },
    {
      message: "Não é possível selecionar armário e gaveta ao mesmo tempo",
      path: ["gaveta_id"],
    }
  )
  .refine(
    (data) => {
      if (data.armario_id !== null) {
        return data.gaveta_id === null;
      }
      return true;
    },
    {
      message: "Não é possível selecionar armário e gaveta ao mesmo tempo",
      path: ["armario_id"],
    }
  )
  .refine(
    (data) => {
      // Casela só pode ser selecionada se armário estiver selecionado
      if (data.casela_id !== null) {
        return data.armario_id !== null && data.gaveta_id === null;
      }
      return true;
    },
    {
      message: "Casela só pode ser selecionada quando um armário está selecionado",
      path: ["casela_id"],
    }
  );

export type EditStockFormData = z.infer<typeof editStockSchema>;

