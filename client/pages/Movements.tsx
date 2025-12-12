import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import LoadingModal from "@/components/LoadingModal";
import { getInputMovements, getMedicineMovements } from "@/api/requests";
import { Card } from "@/components/ui/card";

export default function InputMovements() {
  const [entriesPage, setEntriesPage] = useState(1);
  const [exitsPage, setExitsPage] = useState(1);

  const [entries, setEntries] = useState<any[]>([]);
  const [exits, setExits] = useState<any[]>([]);

  const [entriesHasNext, setEntriesHasNext] = useState(false);
  const [exitsHasNext, setExitsHasNext] = useState(false);

  const [loading, setLoading] = useState(true);

  const columnsBase = [
    { key: "name", label: "Produto", editable: false },
    { key: "additionalData", label: "Princípio Ativo", editable: false },
    { key: "quantity", label: "Quantidade", editable: false },
    { key: "operator", label: "Operador", editable: false },
    { key: "movementDate", label: "Data da Transação", editable: false },
    { key: "cabinet", label: "Armário", editable: false },
    { key: "resident", label: "Casela", editable: false },
  ];

  function normalizeMovement(item: any) {
    const isMedicine = item.medicamento_id !== null;

    return {
      id: item.id,
      name: isMedicine
        ? item.MedicineModel?.nome ?? "-"
        : item.InputModel?.nome ?? "-",
      additionalData: isMedicine
        ? item.MedicineModel?.principio_ativo ?? ""
        : item.InputModel?.descricao ?? "",
      quantity: item.quantidade,
      operator: item.LoginModel?.login ?? "",
      movementDate: item.data,
      cabinet: item.CabinetModel?.num_armario ?? item.armario_id ?? "",
      resident: item.ResidentModel?.num_casela ?? "-",
      type: item.tipo,
      validade: item.validade,
    };
  }

  async function fetchEntries(page: number) {
    const [insumos, medicamentos] = await Promise.all([
      getInputMovements({ page }),
      getMedicineMovements({ page }),
    ]);

    const combined = [
      ...insumos.data.map(normalizeMovement),
      ...medicamentos.data.map(normalizeMovement),
    ];

    setEntries(combined.filter((m) => m.type === "entrada"));
    setEntriesHasNext(insumos.hasNext || medicamentos.hasNext);
  }

  async function fetchExits(page: number) {
    const [insumos, medicamentos] = await Promise.all([
      getInputMovements({ page }),
      getMedicineMovements({ page }),
    ]);

    const combined = [
      ...insumos.data.map(normalizeMovement),
      ...medicamentos.data.map(normalizeMovement),
    ];

    setExits(combined.filter((m) => m.type === "saida"));
    setExitsHasNext(insumos.hasNext || medicamentos.hasNext);
  }

  useEffect(() => {
    setLoading(true);

    Promise.all([fetchEntries(entriesPage), fetchExits(exitsPage)]).finally(() =>
      setLoading(false)
    );
  }, [entriesPage, exitsPage]);

  return (
    <Layout title="Movimentações">
      <LoadingModal open={loading} title="Aguarde" description="Carregando..." />

      {!loading && (
        <div className="w-full flex justify-center p-10">

          <Card className="w-full max-w-5xl bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 space-y-12">

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Entradas de produtos
              </h2>

              <EditableTable
                data={entries}
                columns={columnsBase}
                entityType="entries"
                currentPage={entriesPage}
                hasNextPage={entriesHasNext}
                onNextPage={() => setEntriesPage((p) => p + 1)}
                onPrevPage={() => setEntriesPage((p) => Math.max(1, p - 1))}
                showAddons={false}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Saídas de produtos
              </h2>

              <EditableTable
                data={exits}
                columns={columnsBase}
                entityType="exits"
                currentPage={exitsPage}
                hasNextPage={exitsHasNext}
                onNextPage={() => setExitsPage((p) => p + 1)}
                onPrevPage={() => setExitsPage((p) => Math.max(1, p - 1))}
                showAddons={false}
              />
            </div>

          </Card>

        </div>
      )}
    </Layout>
  );
}