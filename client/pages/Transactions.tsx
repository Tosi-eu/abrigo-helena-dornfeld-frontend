import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import EditableTable from "@/components/EditableTable";
import LoadingModal from "@/components/LoadingModal";
import { getInputMovements, getMedicineMovements } from "@/api/requests";

export default function InputMovements() {
  const [entryFilter, setEntryFilter] = useState("");
  const [exitFilter, setExitFilter] = useState("");
  const [medicineMovements, setMedicineMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      movementDate: new Date(item.data).toLocaleDateString("pt-BR"),

      cabinet: item.CabinetModel?.num_armario ?? item.armario_id ?? "",

      resident: item.ResidentModel?.num_casela ?? "",

      type: item.tipo.toUpperCase(),

      validade: item.validade_medicamento
        ? new Date(item.validade_medicamento).toLocaleDateString("pt-BR")
        : new Date(item.validade.toLocaleDateString("pt-BR"))
    };
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [insumosRes, medicamentosRes] = await Promise.all([
          getInputMovements(),
          getMedicineMovements(),
        ]);

        setMedicineMovements([
          ...medicamentosRes.map(normalizeMovement),
          ...insumosRes.map(normalizeMovement),
        ]);

      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const columnsBase = [
    { key: "name", label: "Produto", editable: false },
    { key: "additionalData", label: "Princípio Ativo", editable: false },
    { key: "quantity", label: "Quantidade", editable: false },
    { key: "operator", label: "Operador", editable: false },
    { key: "movementDate", label: "Data da Transação", editable: false },
    { key: "cabinet", label: "Armário", editable: false },
    { key: "resident", label: "Residente", editable: false },
  ];

  const entries = useMemo(
    () =>
      medicineMovements.filter(
        (m) =>
          m.type === "ENTRADA" &&
          (!entryFilter ||
            m.name.toLowerCase().includes(entryFilter.toLowerCase())),
      ),
    [medicineMovements, entryFilter],
  );

  const exits = useMemo(
    () =>
      medicineMovements.filter(
        (m) =>
          m.type === "SAIDA" &&
          (!exitFilter ||
            m.name.toLowerCase().includes(exitFilter.toLowerCase())),
      ),
    [medicineMovements, exitFilter],
  );

  const uniqueNames = useMemo(
    () => Array.from(new Set(medicineMovements.map((m) => m.name))),
    [medicineMovements],
  );

  return (
    <Layout title="Movimentações">
      <LoadingModal
        open={loading}
        title="Aguarde"
        description="Carregando movimentações..."
      />

      {!loading && (
        <div className="space-y-10">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-700">Entradas</h2>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                list="entryNames"
                value={entryFilter}
                onChange={(e) => setEntryFilter(e.target.value)}
                placeholder="Filtrar por nome..."
                className="border border-slate-300 rounded-md px-3 py-1 text-sm w-64 focus:ring-2 focus:ring-sky-300 focus:outline-none"
              />
              <datalist id="entryNames">
                {uniqueNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              {entryFilter && (
                <button
                  onClick={() => setEntryFilter("")}
                  className="text-xs text-sky-600 hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <EditableTable
              data={entries}
              columns={columnsBase}
              showAddons={false}
              entityType="entries"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-700">Saídas</h2>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                list="exitNames"
                value={exitFilter}
                onChange={(e) => setExitFilter(e.target.value)}
                placeholder="Filtrar por nome..."
                className="border border-slate-300 rounded-md px-3 py-1 text-sm w-64 focus:ring-2 focus:ring-sky-300 focus:outline-none"
              />
              <datalist id="exitNames">
                {uniqueNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              {exitFilter && (
                <button
                  onClick={() => setExitFilter("")}
                  className="text-xs text-sky-600 hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <EditableTable
              data={exits}
              columns={columnsBase}
              showAddons={false}
              entityType="exits"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
