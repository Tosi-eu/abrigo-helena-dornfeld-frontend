import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { getCabinets } from "@/api/requests";
import { toast } from "@/hooks/use-toast.hook";

const DEFAULT_LIMIT = 10;

export default function Cabinets() {
  const columns = [
    { key: "numero", label: "Número", editable: false },
    { key: "categoria", label: "Categoria", editable: false },
  ];

  const [cabinets, setCabinets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  async function fetchCabinets(pageNumber: number) {
    try {
      setLoading(true);

      const res = await getCabinets(pageNumber, DEFAULT_LIMIT);

      setCabinets(Array.isArray(res.data) ? res.data : []);
      setPage(res.page ?? pageNumber);
      setHasNextPage(Boolean(res.hasNext));
    } catch (err: any) {
      toast({
        title: "Erro ao carregar armários",
        description: err.message ?? "Erro inesperado",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCabinets(1);
  }, []);

  return (
    <Layout title="Armários">
      <div className="pt-12">

        {!loading && (
          <div className="max-w-3xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <EditableTable
              data={cabinets}
              columns={columns}
              entityType="cabinets"
              currentPage={page}
              hasNextPage={hasNextPage}
              onNextPage={() => {
                if (hasNextPage) {
                  fetchCabinets(page + 1);
                }
              }}
              onPrevPage={() => {
                if (page > 1) {
                  fetchCabinets(page - 1);
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