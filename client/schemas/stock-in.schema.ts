import { z } from "zod";
import { OperationType } from "@/utils/enums";

export const stockInSchema = z.object({
  operationType: z.enum([OperationType.MEDICINE, OperationType.INPUT], {
    required_error: "Selecione o tipo de entrada",
  }),
});

export type StockInFormData = z.infer<typeof stockInSchema>;
