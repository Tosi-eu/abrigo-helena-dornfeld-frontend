import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import logo from "/logo.png";
import { resetPassword } from "@/api/requests";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !newPassword) {
      return toast({
        title: "Erro",
        description: "Informe e-mail e nova senha",
        variant: "error",
      });
    }

    setLoading(true);

    try {
      await resetPassword(email, newPassword);

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

      <main className="flex-1 flex items-center justify-center px-4">
        <form
          onSubmit={handleResetPassword}
          className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm w-full max-w-md space-y-5"
        >
          <h2 className="text-2xl font-semibold text-slate-800 text-center">
            Redefinir Senha
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              E-mail cadastrado
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Redefinir Senha"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/user/login")}
            className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Voltar
          </button>
        </form>
      </main>
    </div>
  );
}
