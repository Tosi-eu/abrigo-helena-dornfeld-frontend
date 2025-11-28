import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import LoadingModal from "@/components/LoadingModal";
import { getResidents } from "@/api/requests";

export default function Resident() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { key: "name", label: "Nome", editable: true },
    { key: "casela", label: "Casela", editable: true },
  ];

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        await getResidents().then((data) => {
          setResidents(data);
        });
      } catch (err: any) {
        console.error("Erro ao buscar residentes:", err);
        setError(err.message ?? "Erro ao buscar residentes");
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  return (
    <Layout title="Residentes">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando residentes..."
      />

      {!loading && error && (
        <div className="text-center mt-10 text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="max-w-3xl mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <EditableTable
            data={residents}
            columns={columns}
            entityType="residents"
          />
        </div>
      )}
    </Layout>
  );
}
