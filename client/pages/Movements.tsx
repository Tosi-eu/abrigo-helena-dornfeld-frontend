import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";

import { getInputMovements, getMedicineMovements } from "@/api/requests";
import { Card } from "@/components/ui/card";

const TABLE_LIMIT = 10;
const REQUEST_LIMIT = 5;

export default function InputMovements() {
  const [entriesInputPage, setEntriesInputPage] = useState(1);
  const [entriesMedicinePage, setEntriesMedicinePage] = useState(1);
  const [entriesHasNext, setEntriesHasNext] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const entriesRequestId = useRef(0);

  const [exitsInputPage, setExitsInputPage] = useState(1);
  const [exitsMedicinePage, setExitsMedicinePage] = useState(1);
  const [exitsHasNext, setExitsHasNext] = useState(false);
  const [exits, setExits] = useState<any[]>([]);
  const exitsRequestId = useRef(0);

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
        ? (item.MedicineModel?.nome ?? "-")
        : (item.InputModel?.nome ?? "-"),
      additionalData: isMedicine
        ? (item.MedicineModel?.principio_ativo ?? "")
        : (item.InputModel?.descricao ?? ""),
      quantity: item.quantidade,
      operator: item.LoginModel?.login ?? "",
      movementDate: item.data,
      cabinet: item.CabinetModel?.num_armario ?? item.armario_id ?? "",
      resident: item.ResidentModel?.num_casela ?? "-",
      type: item.tipo,
    };
  }

  async function fetchEntries() {
    const requestId = ++entriesRequestId.current;

    const [insumos, medicamentos] = await Promise.all([
      getInputMovements({
        type: "entrada",
        limit: REQUEST_LIMIT,
        page: entriesInputPage,
      }),
      getMedicineMovements({
        type: "entrada",
        limit: REQUEST_LIMIT,
        page: entriesMedicinePage,
      }),
    ]);

    if (requestId !== entriesRequestId.current) return;

    const merged = [
      ...insumos.data.map(normalizeMovement),
      ...medicamentos.data.map(normalizeMovement),
    ].sort(
      (a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime(),
    );

    setEntries(merged.slice(0, TABLE_LIMIT));
    setEntriesHasNext(
      insumos.hasNext || medicamentos.hasNext || merged.length > TABLE_LIMIT,
    );
  }

  async function fetchExits() {
    const requestId = ++exitsRequestId.current;

    const [insumos, medicamentos] = await Promise.all([
      getInputMovements({
        type: "saida",
        limit: REQUEST_LIMIT,
        page: exitsInputPage,
      }),
      getMedicineMovements({
        type: "saida",
        limit: REQUEST_LIMIT,
        page: exitsMedicinePage,
      }),
    ]);

    if (requestId !== exitsRequestId.current) return;

    const merged = [
      ...insumos.data.map(normalizeMovement),
      ...medicamentos.data.map(normalizeMovement),
    ].sort(
      (a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime(),
    );

    setExits(merged.slice(0, TABLE_LIMIT));
    setExitsHasNext(
      insumos.hasNext || medicamentos.hasNext || merged.length > TABLE_LIMIT,
    );
  }

  useEffect(() => {
    setLoading(true);
    fetchEntries().finally(() => setLoading(false));
  }, [entriesInputPage, entriesMedicinePage]);

  useEffect(() => {
    setLoading(true);
    fetchExits().finally(() => setLoading(false));
  }, [exitsInputPage, exitsMedicinePage]);

  return (
    <Layout title="Movimentações">
      {!loading && (
        <div className="w-full flex justify-center p-10">
          <Card className="w-full max-w-5xl bg-white border shadow-md p-8 space-y-12">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Entradas</h2>

              <EditableTable
                data={entries}
                columns={columnsBase}
                entityType="entries"
                currentPage={Math.max(
                  entriesInputPage,
                  entriesMedicinePage,
                )}
                hasNextPage={entriesHasNext}
                onNextPage={() => {
                  setEntriesInputPage((p) => p + 1);
                  setEntriesMedicinePage((p) => p + 1);
                }}
                onPrevPage={() => {
                  setEntriesInputPage((p) => Math.max(1, p - 1));
                  setEntriesMedicinePage((p) => Math.max(1, p - 1));
                }}
                showAddons={false}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Saídas</h2>

              <EditableTable
                data={exits}
                columns={columnsBase}
                entityType="exits"
                currentPage={Math.max(exitsInputPage, exitsMedicinePage)}
                hasNextPage={exitsHasNext}
                onNextPage={() => {
                  setExitsInputPage((p) => p + 1);
                  setExitsMedicinePage((p) => p + 1);
                }}
                onPrevPage={() => {
                  setExitsInputPage((p) => Math.max(1, p - 1));
                  setExitsMedicinePage((p) => Math.max(1, p - 1));
                }}
                showAddons={false}
              />
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
