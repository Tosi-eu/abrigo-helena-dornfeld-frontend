import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { SkeletonTable } from "@/components/SkeletonTable";
import { TableFilter } from "@/components/TableFilter";
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
  const [searchFilter, setSearchFilter] = useState("");

  async function fetchMedicines(pageNumber: number) {
    setLoading(true);
    try {
      const res = await getMedicines(pageNumber, DEFAULT_PAGE_SIZE);

      const data = Array.isArray(res.data) ? res.data : [];
      setMedicines(data);
      setPage(res.page ?? pageNumber);
      setHasNextPage(res.hasNext);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      toast({
        title: "Erro ao carregar medicamentos",
        description: errorMessage,
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredMedicines = useMemo(() => {
    if (!searchFilter.trim()) {
      return medicines;
    }

    const filterLower = searchFilter.toLowerCase();
    return medicines.filter((medicine) => {
      const nome = String(medicine.nome || "").toLowerCase();
      return nome.includes(filterLower);
    });
  }, [medicines, searchFilter]);

  useEffect(() => {
    fetchMedicines(1);
  }, []);

  return (
    <Layout title="Medicamentos">
      <div className="pt-8">
        <div className="w-full mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="mb-4">
            <TableFilter
              placeholder="Buscar por nome"
              onFilterChange={setSearchFilter}
            />
          </div>
          {loading ? (
            <SkeletonTable rows={5} cols={columns.length} />
          ) : (
            <EditableTable
              data={filteredMedicines}
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
