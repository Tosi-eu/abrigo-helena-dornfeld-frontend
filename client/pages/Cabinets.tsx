import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import { useQuery } from "@tanstack/react-query";
import { getCabinets } from "@/api/requests";

export default function Cabinets() {
  const columns = [
    { key: "numero", label: "Número", editable: false },
    { key: "categoria", label: "Categoria", editable: false },
  ];

  const {
    data: cabinets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cabinets"],
    queryFn: getCabinets,
  });

  if (isLoading)
    return (
      <Layout title="Armários">
        <p>Carregando armários!</p>
      </Layout>
    );

  if (error)
    return (
      <Layout title="Armários">
        <p className="text-red-600">Erro ao carregar armários.</p>
      </Layout>
    );

  return (
    <Layout title="Armários">
        <div className="pt-12">
          <div className="max-w-3xl mx-auto mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <EditableTable
              data={cabinets}
              columns={columns}
              entityType="cabinets"
            />
          </div>
        </div>
    </Layout>
  );
}
