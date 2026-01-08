import { z } from "zod";

export const profileSchema = z
  .object({
    currentLogin: z.string().min(1, "Login atual é obrigatório"),
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    login: z
      .string()
      .min(1, "Novo login é obrigatório")
      .email("Login deve ser um e-mail válido")
      .max(255, "Login deve ter no máximo 255 caracteres"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .max(128, "Senha deve ter no máximo 128 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
        "Senha deve conter: letra maiúscula, letra minúscula, número e caractere especial"
      ),
  })
  .refine((data) => data.currentLogin !== data.login, {
    message: "O novo login deve ser diferente do atual",
    path: ["login"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;

