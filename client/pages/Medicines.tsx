import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast.hook";
import LoadingModal from "@/components/LoadingModal";
import { getMedicines } from "@/api/requests";

const DEFAULT_LIMIT = 10;

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const fetchMedicines = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const res = await getMedicines(pageToLoad, DEFAULT_LIMIT);

      setMedicines(Array.isArray(res.data) ? res.data : []);

      setPage(res.page ?? pageToLoad);
      setHasNext(res.hasNext ?? false);
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

  const goNextPage = () => {
    if (hasNext) fetchMedicines(page + 1);
  };

  const goPrevPage = () => {
    if (page > 1) fetchMedicines(page - 1);
  };

  useEffect(() => {
    fetchMedicines(1);
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
            { key: "nome", label: "Nome" },
            { key: "principio_ativo", label: "Princípio Ativo" },
            { key: "dosagem", label: "Dosagem" },
            { key: "unidade_medida", label: "Unidade" },
            { key: "estoque_minimo", label: "Estoque Mínimo" },
          ]}
          entityType="medicines"
          currentPage={page}
          hasNextPage={hasNext}
          onNextPage={goNextPage}
          onPrevPage={goPrevPage}
        />
      )}
    </Layout>
  );
}