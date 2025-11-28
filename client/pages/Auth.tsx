import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logo from "/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { register } from "@/api/requests";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await authLogin(login, password);
        toast({ title: "Login realizado!", variant: "success" });
      } else {
        await register(login, password);
        toast({ title: "Cadastro realizado!", variant: "success" });
      }

      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "error" });
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
            <div />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6">
              {isLogin ? "Acesso ao Sistema" : "Cadastro de Usuário"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  E-mail
                </label>
                <input
                  id="login"
                  type="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  placeholder="fulana_de_tal@gmail.com"
                  required
                  autoComplete="login"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  placeholder="••••••••••••"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-300"
                    />
                    <span className="text-sm text-slate-700">
                      Lembrar de mim
                    </span>
                  </label>
                  <Link
                    to="/user/forgot-password"
                    className="text-sm text-sky-600 hover:underline mt-2 block text-center"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-shadow shadow-sm disabled:opacity-50"
                >
                  {isLogin ? "Entrar" : "Cadastrar"}
                </button>
              </div>
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
      </main>
    </div>
  );
}
