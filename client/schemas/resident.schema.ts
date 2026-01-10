import { z } from "zod";

export const residentSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(60, "Nome deve ter no máximo 60 caracteres")
    .trim(),
  casela: z
    .string()
    .min(1, "Casela é obrigatória")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1 && num <= 200;
      },
      {
        message: "Casela deve ser um número entre 1 e 200",
      },
    ),
});

export type ResidentFormData = z.infer<typeof residentSchema>;
