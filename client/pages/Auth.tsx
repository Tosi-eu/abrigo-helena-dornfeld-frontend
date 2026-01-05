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

  const handlePasswordChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setPassword(sanitized);
    if (!isLogin && sanitized.length > 0) {
      const validation = validatePassword(sanitized);
      setPasswordStrength(validation.strength || null);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      const emailValidation = validateEmail(login);
      if (!emailValidation.valid) {
        toast({
          title: "E-mail inválido",
          description: emailValidation.error || "Por favor, insira um e-mail válido.",
          variant: "error",
        });
        setLoading(false);
        return;
      }

      // Validate password (only for registration)
      if (!isLogin) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          toast({
            title: "Senha inválida",
            description: passwordValidation.error || "A senha não atende aos requisitos.",
            variant: "error",
          });
          setLoading(false);
          return;
        }
      }

      const sanitizedLogin = sanitizeInput(login);
      const sanitizedPassword = sanitizeInput(password);

      if (isLogin) {
        await authLogin(sanitizedLogin, sanitizedPassword);
        toast({ title: "Login realizado!", variant: "success" });
      } else {
        await register(sanitizedLogin, sanitizedPassword);
        await authLogin(sanitizedLogin, sanitizedPassword);
        toast({ title: "Cadastro realizado!", variant: "success" });
      }

      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message ?? "Erro ao autenticar",
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
                    {!isLogin && (
                      <span className="text-xs text-slate-500 ml-2">
                        (mín. 8 caracteres, incluir maiúscula, minúscula, número e especial)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    maxLength={128}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    placeholder="••••••••••••"
                    required
                  />
                  {!isLogin && passwordStrength && (
                    <div className="mt-1 text-xs">
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
                  disabled={loading}
                  className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {isLogin ? "Entrar" : "Cadastrar"}
                </button>
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

