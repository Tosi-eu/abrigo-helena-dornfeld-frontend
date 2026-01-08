import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { SkeletonTable } from "@/components/SkeletonTable";
import { getMedicines } from "@/api/requests";
import { toast } from "@/hooks/use-toast.hook";
import { DEFAULT_PAGE_SIZE } from "@/helpers/paginacao.helper";

const columns = [
  { key: "nome", label: "Nome" },
  { key: "principio_ativo", label: "Princípio Ativo" },
  { key: "dosagem", label: "Dosagem" },
  { key: "unidade_medida", label: "Unidade" },
  { key: "estoque_minimo", label: "Estoque Mínimo" },
];

export default function Medicines() {
  const [medicines, setMedicines] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchMedicines(pageNumber: number) {
    setLoading(true);
    try {
      const res = await getMedicines(pageNumber, DEFAULT_PAGE_SIZE);

      setMedicines(Array.isArray(res.data) ? res.data : []);
      setPage(res.page ?? pageNumber);
      setHasNextPage(res.hasNext);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      toast({
        title: "Erro ao carregar medicamentos",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMedicines(1);
  }, []);

  return (
    <Layout title="Medicamentos">
      <div className="pt-12">
        <div className="max-w-4xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          {loading ? (
            <SkeletonTable rows={5} cols={columns.length} />
          ) : (
            <EditableTable
              data={medicines}
              columns={columns}
              entityType="medicines"
              currentPage={page}
              hasNextPage={hasNextPage}
              onNextPage={() => {
                if (hasNextPage) {
                  fetchMedicines(page + 1);
                }
              }}
              onPrevPage={() => {
                if (page > 1) {
                  fetchMedicines(page - 1);
                }
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
