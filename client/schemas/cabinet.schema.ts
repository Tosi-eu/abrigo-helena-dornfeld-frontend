import { z } from "zod";

export const cabinetSchema = z.object({
  numero: z
    .string()
    .min(1, "Número é obrigatório")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: "Número deve ser um número válido maior que zero",
      }
    ),
  categoria_id: z
    .string()
    .min(1, "Categoria é obrigatória")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: "Categoria inválida",
      }
    ),
});

export type CabinetFormData = z.infer<typeof cabinetSchema>;

