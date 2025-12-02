import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useToast } from "@/hooks/use-toast";
import LoadingModal from "@/components/LoadingModal";
import { getInputs } from "@/api/requests";

export default function Inputs() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const columns = [
    { key: "nome", label: "Nome", editable: true },
    { key: "descricao", label: "Descrição", editable: true },
    { key: "estoque_minimo", label: "Estoque Mínimo", editable: true },
  ];

  const fetchInputs = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const result = await getInputs(pageNumber, 10);

      const rows = Array.isArray(result.data) ? result.data : [];

      setData(rows);
      setTotal(result.total ?? 0);
      setHasNextPage(result.hasNext ?? false);
      setPage(result.page ?? 1);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar insumos",
        description: err.message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInputs(1);
  }, []);

  const handleNext = () => {
    if (hasNextPage) fetchInputs(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) fetchInputs(page - 1);
  };

  return (
    <Layout title="Insumos">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando insumos..."
      />

      {!loading && (
        <div className="space-y-6">
          <EditableTable
            data={data}
            columns={columns}
            entityType="inputs"
            currentPage={page}
            hasNextPage={hasNextPage}
            onNextPage={handleNext}
            onPrevPage={handlePrev}
          />
        </div>
      )}
    </Layout>
  );
}
