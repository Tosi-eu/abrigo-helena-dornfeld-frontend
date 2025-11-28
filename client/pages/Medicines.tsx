import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import LoadingModal from "@/components/LoadingModal";
import { getMedicines } from "@/api/requests";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await getMedicines();
      setMedicines(res);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao carregar medicamentos",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <Layout title="Medicamentos">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando medicamentos..."
      />

      {!loading && (
        <EditableTable
          data={medicines}
          columns={[
            { key: "nome", label: "Nome", editable: true },
            {
              key: "principio_ativo",
              label: "Princípio Ativo",
              editable: true,
            },
            { key: "dosagem", label: "Dosagem", editable: true },
            { key: "unidade_medida", label: "Unidade", editable: true },
            { key: "estoque_minimo", label: "Estoque Mínimo", editable: true },
          ]}
          entityType="medicines"
        />
      )}
    </Layout>
  );
}
