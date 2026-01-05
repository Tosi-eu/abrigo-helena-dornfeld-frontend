import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import logo from "/logo.png";
import { resetPassword } from "@/api/requests";
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from "@/helpers/validation.helper";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);

  const handlePasswordChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setNewPassword(sanitized);
    if (sanitized.length > 0) {
      const validation = validatePassword(sanitized);
      setPasswordStrength(validation.strength || null);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return toast({
        title: "E-mail inválido",
        description: emailValidation.error || "Informe um e-mail válido",
        variant: "error",
      });
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return toast({
        title: "Senha inválida",
        description: passwordValidation.error || "A senha não atende aos requisitos",
        variant: "error",
      });
    }

    setLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(newPassword);
      await resetPassword(sanitizedEmail, sanitizedPassword);

      toast({
        title: "Sucesso!",
        description: "Senha redefinida. Faça login com a nova senha.",
        variant: "success",
      });

      setTimeout(() => navigate("/user/login"), 1500);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-20 w-auto" />
              <h1 className="text-lg md:text-xl font-semibold text-slate-900 hidden md:block">
                Abrigo Helena Dornfeld
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Redefinir Senha
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="flex flex-col gap-2">
                <Label>E-mail cadastrado</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                  maxLength={255}
                  placeholder="email@exemplo.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Nova senha
                  <span className="text-xs text-slate-500 ml-2">
                    (mín. 8 caracteres, incluir maiúscula, minúscula, número e especial)
                  </span>
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  maxLength={128}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                {passwordStrength && (
                  <div className="text-xs mt-1">
                    <span
                      className={
                        passwordStrength === "strong"
                          ? "text-green-600"
                          : passwordStrength === "medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      Força:{" "}
                      {passwordStrength === "strong"
                        ? "Forte"
                        : passwordStrength === "medium"
                          ? "Média"
                          : "Fraca"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700"
              >
                {loading ? "Processando..." : "Redefinir Senha"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/user/login")}
                className="w-full"
              >
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
