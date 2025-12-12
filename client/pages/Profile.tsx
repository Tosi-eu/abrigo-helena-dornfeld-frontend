import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import Layout from "@/components/Layout";
import { updateUser } from "@/api/requests";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";

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
    localStorage.removeItem("user");
    navigate("/user/login");
  };

  return (
    <Layout title="Meu Perfil">
      <div className="flex justify-center py-24 px-4">
        <Card className="w-full max-w-md shadow-lg border border-slate-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              Editar Perfil
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentEmail">E-mail atual</Label>
                  <Input
                    id="currentEmail"
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newEmail">Novo e-mail</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <CardFooter className="flex gap-2 px-0">
                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
                  Salvar
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="whitespace-nowrap"
                  onClick={() => setLogoutOpen(true)}
                >
                  Sair
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <LogoutConfirmDialog
          open={logoutOpen}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => {
            setLogoutOpen(false);
            handleLogout();
          }}
        />
      </div>

      <div className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Abrigo Helena Dornfeld
      </div>
    </Layout>
  );
}