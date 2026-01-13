import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import Layout from "@/components/Layout";
import { updateUser } from "@/api/requests";
import { getErrorMessage } from "@/helpers/validation.helper";
import { authStorage } from "@/helpers/auth.helper";
import { profileSchema, type ProfileFormData } from "@/schemas/profile.schema";

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
  const [logoutOpen, setLogoutOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      currentLogin: "",
      currentPassword: "",
      login: "",
      password: "",
    },
  });

  useEffect(() => {
    try {
      const user = authStorage.getUser();
      if (user) {
        reset({
          currentLogin: user.login || "",
          currentPassword: "",
          login: user.login || "",
          password: "",
        });
      }
    } catch (e) {}
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateUser({
        login: data.login.trim(),
        password: data.password,
        currentLogin: data.currentLogin.trim(),
        currentPassword: data.currentPassword,
      });

      authStorage.setUser(response);

      toast({ title: "Perfil atualizado", variant: "success", duration: 3000 });

      reset({
        currentLogin: response.login || "",
        currentPassword: "",
        login: response.login || "",
        password: "",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "error",
        duration: 3000,
      });
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentLogin">E-mail atual</Label>
                  <Input
                    id="currentLogin"
                    type="email"
                    {...register("currentLogin")}
                    maxLength={255}
                    disabled={isSubmitting}
                    aria-invalid={errors.currentLogin ? "true" : "false"}
                  />
                  {errors.currentLogin && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.currentLogin.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...register("currentPassword")}
                    maxLength={128}
                    disabled={isSubmitting}
                    aria-invalid={errors.currentPassword ? "true" : "false"}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="login">Novo e-mail</Label>
                  <Input
                    id="login"
                    type="email"
                    {...register("login")}
                    maxLength={255}
                    disabled={isSubmitting}
                    aria-invalid={errors.login ? "true" : "false"}
                  />
                  {errors.login && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.login.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    maxLength={128}
                    disabled={isSubmitting}
                    className={
                      errors.password
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : ""
                    }
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <CardFooter className="flex gap-2 px-0">
                <Button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar"}
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
