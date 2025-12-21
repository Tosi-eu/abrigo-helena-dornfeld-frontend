import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { getMedicines } from "@/api/requests";
import { toast } from "@/hooks/use-toast.hook";
import { DEFAULT_PAGE_SIZE } from "@/helpers/paginacao.helper";

export default function Medicines() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  async function fetchMedicines(pageNumber: number) {
    try {
      setLoading(true);

      const res = await getMedicines(pageNumber, DEFAULT_PAGE_SIZE);

      setMedicines(Array.isArray(res.data) ? res.data : []);
      setPage(res.page ?? pageNumber);
      setHasNextPage(res.hasNext);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao carregar medicamentos",
        description: err.message ?? "Erro inesperado",
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
        {!loading && (
          <div className="max-w-4xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <EditableTable
              data={medicines}
              columns={[
                { key: "nome", label: "Nome" },
                { key: "principio_ativo", label: "Princípio Ativo" },
                { key: "dosagem", label: "Dosagem" },
                { key: "unidade_medida", label: "Unidade" },
                { key: "estoque_minimo", label: "Estoque Mínimo" },
              ]}
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

            <div className="text-sm text-slate-500 text-center mt-4">
              Página {page}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
