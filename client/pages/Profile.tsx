import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import Layout from "@/components/Layout";
import { updateUser } from "@/api/requests";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentEmail(u.login || "");
        setNewEmail(u.login || "");
        setUserId(u.id || null);
      }
    } catch (e) {
      console.error("Erro ao ler usuário do localStorage", e);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId)
      return toast({ title: "Usuário não identificado", variant: "error" });
    setLoading(true);

    try {
      if (!currentPassword)
        throw new Error("Senha atual é obrigatória para autenticar");
      if (!newPassword) throw new Error("Informe a nova senha");

      const { data } = await updateUser(userId, {
        login: newEmail,
        password: newPassword,
        currentLogin: currentEmail,
        currentPassword,
      });

      localStorage.setItem("user", JSON.stringify(data));

      toast({ title: "Perfil atualizado", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setCurrentEmail(data.login || "");
      setNewEmail(data.login || "");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
    } catch (e) {}
    navigate("/user/login");
  };

  return (
    <Layout title="Meu Perfil">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6">
              Editar Perfil
            </h2>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="mb-2">
                <label
                  htmlFor="currentEmail"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  E-mail atual
                </label>
                <input
                  id="currentEmail"
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  placeholder="fulana_de_tal@gmail.com"
                  required
                />

                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-slate-700 mt-3 mb-2"
                >
                  Senha atual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="mb-2">
                <label
                  htmlFor="newEmail"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Novo e-mail
                </label>
                <input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  placeholder="novo_email@gmail.com"
                  required
                />

                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-slate-700 mt-3 mb-2"
                >
                  Nova senha
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-shadow shadow-sm disabled:opacity-50"
                >
                  Salvar
                </button>

                <button
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Sair
                </button>
              </div>
              <LogoutConfirmDialog
                open={logoutOpen}
                onCancel={() => setLogoutOpen(false)}
                onConfirm={() => {
                  setLogoutOpen(false);
                  handleLogout();
                }}
              />
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Abrigo Helena Dornfeld
          </div>
        </div>
      </div>
    </Layout>
  );
}
