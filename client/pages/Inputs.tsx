import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useToast } from "@/hooks/use-toast.hook";
import { getInputs } from "@/api/requests";

export default function Inputs() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const columns = [
    { key: "nome", label: "Nome", editable: true },
    { key: "descricao", label: "Descrição", editable: true },
    { key: "estoque_minimo", label: "Estoque Mínimo", editable: true },
  ];

  async function fetchInputs(pageNumber: number) {
    try {
      setLoading(true);

      const res = await getInputs(pageNumber, 10);

      setData(Array.isArray(res.data) ? res.data : []);
      setPage(res.page ?? pageNumber);
      setHasNextPage(Boolean(res.hasNext));
    } catch (err: any) {
      toast({
        title: "Erro ao carregar insumos",
        description: err.message ?? "Erro inesperado",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInputs(1);
  }, []);

  return (
    <Layout title="Insumos">
      <div className="pt-12">
        
        {!loading && (
          <div className="max-w-3xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <EditableTable
              data={data}
              columns={columns}
              entityType="inputs"
              currentPage={page}
              hasNextPage={hasNextPage}
              onNextPage={() => {
                if (hasNextPage) {
                  fetchInputs(page + 1);
                }
              }}
              onPrevPage={() => {
                if (page > 1) {
                  fetchInputs(page - 1);
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
