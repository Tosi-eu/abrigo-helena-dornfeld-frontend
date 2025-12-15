import { useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import LoadingModal from "@/components/LoadingModal";
import { createResident } from "@/api/requests";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterResident() {
  const [name, setName] = useState("");
  const [casela, setCasela] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createResident(name, casela);

      toast({
        title: "Residente cadastrado",
        description: "O residente foi registrado com sucesso.",
        variant: "success",
      });

      navigate("/residents");
    } catch (err: any) {
      console.error("Erro ao cadastrar residente:", err);
      toast({
        title: "Erro ao cadastrar",
        description: err?.message ?? "Não foi possível cadastrar o residente.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Cadastro de Residente e Casela">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Cadastrando residente..."
      />

      <Card className="max-w-lg mx-auto mt-20 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Cadastro de Residente
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>Nome do residente</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do residente"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Casela</Label>
              <Input
                value={casela}
                onChange={(e) => setCasela(e.target.value)}
                placeholder="120"
                disabled={loading}
                required
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/residents")}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Cadastrar Residente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
