import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import LoadingModal from "@/components/LoadingModal";
import { getInputMovements, getMedicineMovements } from "@/api/requests";
import { Card } from "@/components/ui/card";

const PAGE_LIMIT = 5;

export default function InputMovements() {
  const [entriesPage, setEntriesPage] = useState(1);
  const [exitsPage, setExitsPage] = useState(1);

  const [allMovements, setAllMovements] = useState<any[]>([]);
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

  async function fetchMovements() {
    const [insumos, medicamentos] = await Promise.all([
      getInputMovements({ limit: 1000 }),
      getMedicineMovements({ limit: 1000 }),
    ]);

    const merged = [
      ...insumos.data.map(normalizeMovement),
      ...medicamentos.data.map(normalizeMovement),
    ];

    merged.sort(
      (a, b) =>
        new Date(b.movementDate).getTime() -
        new Date(a.movementDate).getTime()
    );

    setAllMovements(merged);
  }

  useEffect(() => {
    setLoading(true);
    fetchMovements().finally(() => setLoading(false));
  }, []);

  const entriesAll = useMemo(
    () => allMovements.filter((m) => m.type === "entrada"),
    [allMovements]
  );

  const exitsAll = useMemo(
    () => allMovements.filter((m) => m.type === "saida"),
    [allMovements]
  );

  const entriesTotalPages = Math.max(
    1,
    Math.ceil(entriesAll.length / PAGE_LIMIT)
  );

  const exitsTotalPages = Math.max(
    1,
    Math.ceil(exitsAll.length / PAGE_LIMIT)
  );

  const entries = useMemo(() => {
    const start = (entriesPage - 1) * PAGE_LIMIT;
    return entriesAll.slice(start, start + PAGE_LIMIT);
  }, [entriesAll, entriesPage]);

  const exits = useMemo(() => {
    const start = (exitsPage - 1) * PAGE_LIMIT;
    return exitsAll.slice(start, start + PAGE_LIMIT);
  }, [exitsAll, exitsPage]);

  return (
    <Layout title="Movimentações">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando..."
      />

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
                hasNextPage={entriesPage < entriesTotalPages}
                onNextPage={() =>
                  setEntriesPage((p) =>
                    Math.min(entriesTotalPages, p + 1)
                  )
                }
                onPrevPage={() =>
                  setEntriesPage((p) => Math.max(1, p - 1))
                }
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
                hasNextPage={exitsPage < exitsTotalPages}
                onNextPage={() =>
                  setExitsPage((p) =>
                    Math.min(exitsTotalPages, p + 1)
                  )
                }
                onPrevPage={() =>
                  setExitsPage((p) => Math.max(1, p - 1))
                }
                showAddons={false}
              />
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}