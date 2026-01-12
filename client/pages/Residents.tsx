import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { SkeletonTable } from "@/components/SkeletonTable";
import { toast } from "@/hooks/use-toast.hook";
import { getResidents } from "@/api/requests";
import { ResidentRaw } from "@/interfaces/interfaces";

const columns = [
  { key: "name", label: "Nome", editable: true },
  { key: "casela", label: "Casela", editable: true },
];

export default function Resident() {
  const [residents, setResidents] = useState<ResidentRaw[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchResidents(pageNumber: number) {
    setLoading(true);
    try {
      const res = await getResidents(pageNumber, 10);

      setResidents(res.data);
      setHasNextPage(res.hasNext);
      setPage(pageNumber);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a lista de residentes.";
      toast({
        title: "Erro ao carregar residentes",
        description: errorMessage,
        variant: "error",
        duration: 3000,
      });
      setResidents([]);
      setHasNextPage(false);
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
        <div className="w-full mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          {loading ? (
            <SkeletonTable rows={5} cols={columns.length} />
          ) : (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
