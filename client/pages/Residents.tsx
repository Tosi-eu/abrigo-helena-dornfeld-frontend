import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { getResidents } from "@/api/requests";

export default function Resident() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const columns = [
    { key: "name", label: "Nome", editable: true },
    { key: "casela", label: "Casela", editable: true },
  ];

  async function fetchResidents(pageNumber: number) {
    try {
      setLoading(true);

      const res = await getResidents(pageNumber, 10);

      setResidents(res.data);
      setHasNextPage(res.hasNext);
      setPage(pageNumber);
    } catch (err: any) {
      console.error("Erro ao buscar residentes:", err);
      setError(err.message ?? "Erro ao buscar residentes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResidents(1);
  }, []);

  return (
    <Layout title="Residentes">
      <div className="pt-8">
        {!loading && error && (
          <div className="text-center mt-10 text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="max-w-5xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <EditableTable
              data={residents}
              columns={columns}
              entityType="residents"
              currentPage={page}
              hasNextPage={hasNextPage}
              onNextPage={() => {
                if (hasNextPage) {
                  fetchResidents(page + 1);
                }
              }}
              onPrevPage={() => {
                if (page > 1) {
                  fetchResidents(page - 1);
                }
              }}
            />

            <div className="text-sm text-slate-500 text-center mt-4">
              Página {page}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
