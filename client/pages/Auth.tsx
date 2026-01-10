import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import logo from "/logo.png";
import { useAuth } from "@/hooks/use-auth.hook";
import { register } from "@/api/requests";
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from "@/helpers/validation.helper";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
    setPassword(sanitized);
    if (!isLogin && sanitized.length > 0) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailValidation = validateEmail(login);
      if (!emailValidation.valid) {
        toast({
          title: "E-mail inválido",
          description:
            emailValidation.error || "Por favor, insira um e-mail válido.",
          variant: "error",
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!isLogin) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          toast({
            title: "Senha inválida",
            description:
              passwordValidation.error || "A senha não atende aos requisitos.",
            variant: "error",
            duration: 3000,
          });
          setLoading(false);
          return;
        }
      }

      const sanitizedLogin = sanitizeInput(login);
      const sanitizedPassword = sanitizeInput(password);

      if (isLogin) {
        await authLogin(sanitizedLogin, sanitizedPassword);
        toast({
          title: "Login realizado!",
          variant: "success",
          duration: 3000,
        });
      } else {
        await register(sanitizedLogin, sanitizedPassword);
        await authLogin(sanitizedLogin, sanitizedPassword);
        toast({
          title: "Cadastro realizado!",
          variant: "success",
          duration: 3000,
        });
      }

      navigate("/dashboard");
    } catch (err: any) {
      const rawMessage = err?.message?.toLowerCase() || "";

      let errorTitle = "Erro";
      let errorDescription = "Ocorreu um erro inesperado. Tente novamente.";

      if (isLogin) {
        if (rawMessage.includes("credenciais")) {
          errorTitle = "Login ou senha incorretos";
          errorDescription =
            "Verifique seu e-mail e senha. Se esqueceu sua senha, use a opção 'Esqueci minha senha'.";
        } else if (
          rawMessage.includes("login e senha obrigatórios") ||
          rawMessage.includes("obrigatóri")
        ) {
          errorTitle = "Campos obrigatórios";
          errorDescription = "Por favor, preencha o e-mail e a senha.";
        } else if (
          rawMessage.includes("sessão expirada") ||
          rawMessage.includes("token expirado") ||
          rawMessage.includes("sessão inválida")
        ) {
          errorTitle = "Sessão expirada";
          errorDescription =
            "Sua sessão expirou. Por favor, faça login novamente.";
        } else {
          errorTitle = "Erro ao fazer login";
          errorDescription =
            err?.message ||
            "Não foi possível fazer login. Verifique suas credenciais e tente novamente.";
        }
      } else {
        if (
          rawMessage.includes("login já cadastrado") ||
          rawMessage.includes("duplicate") ||
          rawMessage.includes("já existe")
        ) {
          errorTitle = "E-mail já cadastrado";
          errorDescription =
            "Este e-mail já está em uso. Tente fazer login ou use outro e-mail.";
        } else if (
          rawMessage.includes("login e senha obrigatórios") ||
          rawMessage.includes("obrigatóri")
        ) {
          errorTitle = "Campos obrigatórios";
          errorDescription = "Por favor, preencha o e-mail e a senha.";
        } else if (
          rawMessage.includes("senha inválida") ||
          rawMessage.includes("senha não atende")
        ) {
          errorTitle = "Senha inválida";
          errorDescription =
            "A senha não atende aos requisitos de segurança. Verifique as regras de senha.";
        } else {
          errorTitle = "Erro ao cadastrar";
          errorDescription =
            err?.message ||
            "Não foi possível criar a conta. Verifique os dados e tente novamente.";
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col">
      <header className="shrink-0 border-b border-sky-200 bg-sky-100">
        <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
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
                {isLogin ? "Acesso ao Sistema" : "Cadastro de Usuário"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={login}
                    onChange={(e) => setLogin(sanitizeInput(e.target.value))}
                    maxLength={255}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    placeholder="fulana@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    maxLength={128}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      !isLogin &&
                      passwordValidation &&
                      !passwordValidation.valid
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-slate-300 focus:ring-sky-200 focus:border-sky-400"
                    }`}
                    placeholder="••••••••••••"
                    required
                  />
                  {!isLogin && passwordValidation && (
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

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded"
                      />
                      <span className="text-sm text-slate-700">
                        Lembrar de mim
                      </span>
                    </label>

                    <Link
                      to="/user/forgot-password"
                      className="text-sm text-sky-600 hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (!isLogin &&
                      passwordValidation !== null &&
                      !passwordValidation.valid)
                  }
                  className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLogin ? "Entrar" : "Cadastrar"}
                </button>
                {!isLogin &&
                  passwordValidation !== null &&
                  !passwordValidation.valid && (
                    <p className="text-xs text-red-600 text-center mt-1">
                      Corrija a senha antes de continuar
                    </p>
                  )}
              </form>

              <div className="mt-4 text-center text-sm text-slate-600">
                {isLogin ? "Não tem conta?" : "Já possui conta?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sky-600 hover:underline font-medium"
                >
                  {isLogin ? "Cadastre-se" : "Login"}
                </button>
              </div>
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
