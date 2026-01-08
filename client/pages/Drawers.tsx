import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { getDrawers } from "@/api/requests";
import { toast } from "@/hooks/use-toast.hook";

const DEFAULT_LIMIT = 10;

export default function Drawers() {
  const columns = [
    { key: "numero", label: "Número", editable: false },
    { key: "categoria", label: "Categoria", editable: false },
  ];

  const [drawers, setDrawers] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  async function fetchDrawers(pageNumber: number) {
    try {
      const res = await getDrawers(pageNumber, DEFAULT_LIMIT);

      setDrawers(Array.isArray(res.data) ? res.data : []);
      setPage(res.page ?? pageNumber);
      setHasNextPage(Boolean(res.hasNext));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      toast({
        title: "Erro ao carregar gavetas",
        description: errorMessage,
        variant: "error",
      });
    }
  }

  useEffect(() => {
    fetchDrawers(1);
  }, []);

  return (
    <Layout title="Gavetas">
      <div className="pt-12">
        <div className="max-w-3xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <EditableTable
            data={drawers}
            columns={columns}
            entityType="drawers"
            currentPage={page}
            hasNextPage={hasNextPage}
            onNextPage={() => {
              if (hasNextPage) {
                fetchDrawers(page + 1);
              }
            }}
            onPrevPage={() => {
              if (page > 1) {
                fetchDrawers(page - 1);
              }
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
