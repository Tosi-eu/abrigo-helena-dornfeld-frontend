import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import logo from "/logo.png";
import { resetPassword } from "@/api/requests";
import {
  validatePassword,
  sanitizeInput,
} from "@/helpers/validation.helper";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [login, setLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const [passwordValidation, setPasswordValidation] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  const handlePasswordChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setNewPassword(sanitized);
    if (sanitized.length > 0) {
      const validation = validatePassword(sanitized);
      setPasswordStrength(validation.strength || null);
      setPasswordValidation({
        valid: validation.valid,
        error: validation.error,
      });
    } else {
      setPasswordStrength(null);
      setPasswordValidation(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!login.trim()) {
      return toast({
        title: "Login obrigatório",
        description: "Informe seu login",
        variant: "error",
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return toast({
        title: "Senha inválida",
        description: passwordValidation.error || "A senha não atende aos requisitos",
        variant: "error",
      });
    }

    if (newPassword !== confirmPassword) {
      return toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "error",
      });
    }

    setLoading(true);

    try {
      const sanitizedLogin = sanitizeInput(login);
      const sanitizedNewPassword = sanitizeInput(newPassword);
      await resetPassword(sanitizedLogin, sanitizedNewPassword);

      toast({
        title: "Sucesso!",
        description: "Senha redefinida. Faça login com a nova senha.",
        variant: "success",
      });

      navigate("/user/login");
    } catch (err: any) {
      const rawMessage = err?.message?.toLowerCase() || "";
      let errorTitle = "Erro";
      let errorDescription = "Ocorreu um erro ao redefinir a senha.";

      if (rawMessage.includes("login não encontrado") || 
          rawMessage.includes("não encontrado")) {
        errorTitle = "Login não encontrado";
        errorDescription = "O login informado não existe no sistema. Verifique o login e tente novamente.";
      } else {
        errorDescription = err?.message || "Erro ao redefinir senha. Verifique os dados e tente novamente.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col">
      <header className="shrink-0 border-b border-sky-200 bg-sky-100">
        <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
            Abrigo Helena Dornfeld
          </h1>
        </div>
      </header>

      <main className="flex-1 bg-slate-50">
        <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">
                Redefinir Senha
              </h2>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Login
                  </label>
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(sanitizeInput(e.target.value))}
                    maxLength={255}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    placeholder="Seu login"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    maxLength={128}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      passwordValidation && !passwordValidation.valid
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-slate-300 focus:ring-sky-200 focus:border-sky-400"
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                  {passwordValidation && (
                    <div className="mt-1 text-xs">
                      {passwordValidation.valid ? (
                        <span
                          className={
                            passwordStrength === "strong"
                              ? "text-green-600"
                              : passwordStrength === "medium"
                                ? "text-yellow-600"
                                : "text-orange-600"
                          }
                        >
                          ✓ Senha válida - Força:{" "}
                          {passwordStrength === "strong"
                            ? "Forte"
                            : passwordStrength === "medium"
                              ? "Média"
                              : "Aceitável"}
                        </span>
                      ) : (
                        <span className="text-red-600">
                          ✗ {passwordValidation.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
                    maxLength={128}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-slate-300 focus:ring-sky-200 focus:border-sky-400"
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="text-xs text-red-600 mt-1 block">
                      ✗ As senhas não coincidem
                    </span>
                  )}
                  {confirmPassword && newPassword === confirmPassword && newPassword.length > 0 && (
                    <span className="text-xs text-green-600 mt-1 block">
                      ✓ As senhas coincidem
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (passwordValidation !== null && !passwordValidation.valid) ||
                    (confirmPassword && newPassword !== confirmPassword)
                  }
                  className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processando..." : "Redefinir Senha"}
                </button>
                {(passwordValidation !== null && !passwordValidation.valid) && (
                  <p className="text-xs text-red-600 text-center mt-1">
                    Corrija a senha antes de continuar
                  </p>
                )}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 text-center mt-1">
                    As senhas devem coincidir
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/user/login")}
                  className="w-full h-11 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
                >
                  Voltar
                </button>
              </form>
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Abrigo Helena Dornfeld
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
