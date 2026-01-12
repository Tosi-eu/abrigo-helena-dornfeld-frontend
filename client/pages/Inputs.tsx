import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { SkeletonTable } from "@/components/SkeletonTable";
import { TableFilter } from "@/components/TableFilter";
import { useToast } from "@/hooks/use-toast.hook";
import { getInputs } from "@/api/requests";
import { InputRaw } from "@/interfaces/interfaces";

const columns = [
  { key: "nome", label: "Nome", editable: true },
  { key: "descricao", label: "Descrição", editable: true },
  { key: "estoque_minimo", label: "Estoque Mínimo", editable: true },
];

export default function Inputs() {
  const [data, setData] = useState<InputRaw[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const { toast } = useToast();

  async function fetchInputs(pageNumber: number) {
    setLoading(true);
    try {
      const res = await getInputs(pageNumber, 10);

      const inputData = Array.isArray(res.data) ? res.data : [];
      setData(inputData);
      setPage(res.page ?? pageNumber);
      setHasNextPage(Boolean(res.hasNext));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      toast({
        title: "Erro ao carregar insumos",
        description: errorMessage,
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredInputs = useMemo(() => {
    if (!searchFilter.trim()) {
      return data;
    }

    const filterLower = searchFilter.toLowerCase();
    return data.filter((input) => {
      const nome = String(input.nome || "").toLowerCase();
      return nome.includes(filterLower);
    });
  }, [data, searchFilter]);

  useEffect(() => {
    fetchInputs(1);
  }, []);

  return (
    <Layout title="Insumos">
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
              data={filteredInputs}
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
          )}
        </div>
      </div>
    </Layout>
  );
}
