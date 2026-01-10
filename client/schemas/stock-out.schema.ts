import { z } from "zod";
import { OperationType } from "@/utils/enums";

export const stockOutTypeSchema = z.object({
  operationType: z.enum([OperationType.MEDICINE, OperationType.INPUT], {
    required_error: "Selecione o tipo de saída",
  }),
});

export const stockOutQuantitySchema = z.object({
  quantity: z
    .number({
      required_error: "Quantidade é obrigatória",
      invalid_type_error: "Quantidade deve ser um número",
    })
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade deve ser maior que zero")
    .max(999999, "Quantidade não pode ser maior que 999.999"),
});

export type StockOutTypeFormData = z.infer<typeof stockOutTypeSchema>;
export type StockOutQuantityFormData = z.infer<typeof stockOutQuantitySchema>;
