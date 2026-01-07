import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import Layout from "@/components/Layout";
import { updateUser } from "@/api/requests";
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from "@/helpers/validation.helper";
import { authStorage } from "@/helpers/auth.helper";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  const [newPasswordValidation, setNewPasswordValidation] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const user = authStorage.getUser();
      if (user) {
        setCurrentEmail(user?.login || "");
        setNewEmail(user?.login || "");
        setUserId(user.id || null);
      }
    } catch (e) {
      console.error("Erro ao ler usuário do sessionStorage", e);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current email
    const currentEmailValidation = validateEmail(currentEmail);
    if (!currentEmailValidation.valid) {
      return toast({
        title: "E-mail atual inválido",
        description: currentEmailValidation.error,
        variant: "error",
      });
    }

    // Validate new email
    const newEmailValidation = validateEmail(newEmail);
    if (!newEmailValidation.valid) {
      return toast({
        title: "Novo e-mail inválido",
        description: newEmailValidation.error,
        variant: "error",
      });
    }

    // Validate current password
    if (!currentPassword) {
      return toast({
        title: "Senha atual obrigatória",
        description: "A senha atual é obrigatória para autenticar",
        variant: "error",
      });
    }

    // Validate new password
    if (!newPassword) {
      return toast({
        title: "Nova senha obrigatória",
        description: "Informe a nova senha",
        variant: "error",
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return toast({
        title: "Senha inválida",
        description: passwordValidation.error,
        variant: "error",
      });
    }

    setLoading(true);

    try {
      const sanitizedNewEmail = sanitizeInput(newEmail);
      const sanitizedNewPassword = sanitizeInput(newPassword);
      const sanitizedCurrentEmail = sanitizeInput(currentEmail);
      const sanitizedCurrentPassword = sanitizeInput(currentPassword);

      const data = await updateUser({
        login: sanitizedNewEmail,
        password: sanitizedNewPassword,
        currentLogin: sanitizedCurrentEmail,
        currentPassword: sanitizedCurrentPassword,
      });

      authStorage.setUser(data);

      toast({ title: "Perfil atualizado", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordValidation(null);
      setCurrentEmail(data?.login || "");
      setNewEmail(data?.login || "");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authStorage.clearAll();
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
                    onChange={(e) => setCurrentEmail(sanitizeInput(e.target.value))}
                    maxLength={255}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(sanitizeInput(e.target.value))}
                    maxLength={128}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newEmail">
                    Novo e-mail
                  </Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(sanitizeInput(e.target.value))}
                    maxLength={255}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">
                    Nova senha
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      const sanitized = sanitizeInput(e.target.value);
                      setNewPassword(sanitized);
                      if (sanitized.length > 0) {
                        const validation = validatePassword(sanitized);
                        setNewPasswordValidation({
                          valid: validation.valid,
                          error: validation.error,
                        });
                      } else {
                        setNewPasswordValidation(null);
                      }
                    }}
                    maxLength={128}
                    required
                    className={
                      newPasswordValidation && !newPasswordValidation.valid
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : ""
                    }
                  />
                  {newPasswordValidation && (
                    <div className="text-xs mt-1">
                      {newPasswordValidation.valid ? (
                        <span className="text-green-600">✓ Senha válida</span>
                      ) : (
                        <span className="text-red-600">
                          ✗ {newPasswordValidation.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <CardFooter className="flex gap-2 px-0">
                <Button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700"
                  disabled={
                    loading ||
                    (newPasswordValidation !== null && !newPasswordValidation.valid)
                  }
                >
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
