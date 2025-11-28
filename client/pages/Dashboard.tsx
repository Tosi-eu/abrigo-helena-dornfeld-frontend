import Layout from "@/components/Layout";
import { medicines } from "../../mocks/medicines";
import { useEffect, useMemo, useState } from "react";
import { medicineInventory } from "../../mocks/stock";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Sector,
  CartesianGrid,
} from "recharts";
import EditableTable from "@/components/EditableTable";
import LoadingModal from "@/components/LoadingModal";
import { api } from "@/api/canonical";

const daysBetween = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
};

export default function Dashboard() {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [noStock, setNoStock] = useState<number>(0);
  const [belowMin, setBelowMin] = useState<number>(0);
  const [expired, setExpired] = useState<number>(0);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);

  const [cabinetStockData, setCabinetStockData] = useState<any[]>([]);
  const [noStockData, setNoStockData] = useState<any[]>([]);
  const [belowMinData, setBelowMinData] = useState<any[]>([]);
  const [expiredData, setExpiredData] = useState<any[]>([]);
  const [expiringSoonData, setExpiringSoonData] = useState<any[]>([]);
  const [stockDistribution, setStockDistribution] = useState<any[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          noStockRes,
          belowMinRes,
          expiredRes,
          expiringSoonRes,
          medicamentosMovRes,
          insumosMovRes,
          proportionRes,
          cabinetRes,
        ] = await Promise.all([
          api.get("/estoque", { filter: "noStock" }),
          api.get("/estoque", { filter: "belowMin" }),
          api.get("/estoque", { filter: "expired" }),
          api.get("/estoque", { filter: "expiringSoon" }),

          api.get("/movimentacoes/medicamentos", { days: 7 }),
          api.get("/movimentacoes/insumos", { days: 7 }),

          api.get("/estoque/proporcao"),
          api.get("/estoque", { type: "armarios" }),
        ]);

    const recentMovements = [
      ...medicamentosMovRes.map((m: any) => ({
        name: m.MedicamentoModel?.nome || "-",
        type: m.tipo,
        operator: m.LoginModel?.login || "-",
        casela: m.ResidenteModel?.num_casela ?? "-",
        quantity: m.quantidade,
        patient: m.ResidenteModel ? m.ResidenteModel.nome : "-",
        cabinet: m.ArmarioModel?.num_armario ?? "-",
        date: new Date(m.data).toLocaleString("pt-BR"),
      })),
      ...insumosMovRes.map((m: any) => ({
        name: m.InsumoModel?.nome || "-",
        type: m.tipo,
        operator: m.LoginModel?.login || "-",
        casela: m.ResidenteModel?.num_casela ?? "-",
        quantity: m.quantidade,
        patient: m.ResidenteModel ? m.ResidenteModel.nome : "-",
        cabinet: m.ArmarioModel?.num_armario ?? "-",
        date: new Date(m.data).toLocaleString("pt-BR"),
      })),
    ].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

    setNoStock(noStockRes.length);
    setBelowMin(belowMinRes.length);
    setExpired(expiredRes.length);
    setExpiringSoon(expiringSoonRes);
    setNoStockData(noStockRes);
    setBelowMinData(belowMinRes);
    setExpiredData(expiredRes);
    setExpiringSoonData(expiringSoonRes);
    setRecentMovements(recentMovements);

    setStockDistribution([
      {
        name: "Estoque Geral (medicamentos)",
        value: parseFloat(proportionRes.medicamentos_geral.toFixed(2)),
        rawValue: proportionRes.totais.medicamentos_geral,
      },
      {
        name: "Estoque Individual (medicamentos)",
        value: parseFloat(proportionRes.medicamentos_individual.toFixed(2)),
        rawValue: proportionRes.totais.medicamentos_individual,
      },
      {
        name: "Insumos",
        value: proportionRes.insumos,
        rawValue: proportionRes.totais.insumos,
      },
    ]);

    const formattedCabinetData = cabinetRes.map((arm: any) => ({
      cabinet: arm.armario_nome || `Armário ${arm.armario_id}`,
      total: Number(arm.total_geral) || 0,
    }));
    setCabinetStockData(formattedCabinetData);
  } catch (err) {
    console.error("Erro ao carregar dados do dashboard:", err);
  } finally {
    setLoading(false);
  }
};

    fetchDashboardData();
  }, []);

  const expiringMedicines = useMemo(() => {
    return medicineInventory
      .filter((m) => {
        const days = daysBetween(m.expiry, today);
        return days >= 0 && days <= 60;
      })
      .map((m) => {
        const med = medicines.find((x) => x.id === m.medicineId);
        return {
          name: med?.name || "-",
          substance: med?.substance || "-",
          quantity: m.quantity,
          expiry: m.expiry,
        };
      });
  }, []);

  const stats = [
    {
      label: "Sem Estoque",
      value: noStock,
      onClick: () =>
        navigate("/stock", { state: { filter: "noStock", data: noStockData } }),
    },
    {
      label: "Próximo do Mínimo",
      value: belowMin,
      onClick: () =>
        navigate("/stock", {
          state: { filter: "belowMin", data: belowMinData },
        }),
    },
    {
      label: "Vencidos",
      value: expired,
      onClick: () =>
        navigate("/stock", { state: { filter: "expired", data: expiredData } }),
    },
    {
      label: "Vencendo em Breve",
      value: expiringSoon.length,

      onClick: () =>
        navigate("/stock", {
          state: { filter: "expiringSoon", data: expiringSoonData },
        }),
    },
  ];

  const COLORS = ["#0EA5E9", "#FACC15", "#EF4444"];

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ transition: "all 0.3s ease", opacity: 1 }}
        />
      </g>
    );
  };

  return (
    <Layout>
      <LoadingModal
        open={loading}
        title="Carregando Dashboard"
        description="Aguarde enquanto os dados são carregados..."
      />

      {!loading && (
        <div className="space-y-10 pt-10">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  onClick={stat.onClick}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:scale-105 hover:bg-sky-50 transition-all duration-200"
                  style={{ minHeight: 150 }}
                >
                  <div className="text-sm font-medium text-slate-600 mb-2 text-center">
                    {stat.label}
                  </div>
                  <div className="text-[60px] font-bold text-sky-700 leading-none text-center">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-sky-50 flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-800 text-center w-full">
                  Medicamentos Próximos do Vencimento
                </h3>
              </div>

              <EditableTable
                columns={[
                  { key: "name", label: "Medicamento", editable: false },
                  {
                    key: "substance",
                    label: "Princípio Ativo",
                    editable: false,
                  },
                  { key: "quantity", label: "Quantidade", editable: false },
                  {
                    key: "expiry",
                    label: "Validade",
                    editable: false,
                  },
                ]}
                data={expiringMedicines}
                showAddons={false}
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-sky-50 flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-800 text-center w-full">
                  Movimentações Recentes
                </h3>
              </div>

              <EditableTable
                columns={[
                  { key: "name", label: "Medicamento", editable: false },
                  { key: "type", label: "Tipo", editable: false },
                  { key: "operator", label: "Operador", editable: false },
                  { key: "casela", label: "Casela", editable: false },
                  { key: "quantity", label: "Quantidade", editable: false },
                  { key: "patient", label: "Paciente", editable: false },
                  {
                    key: "date",
                    label: "Data da Movimentação",
                    editable: false,
                  },
                ]}
                data={recentMovements}
                showAddons={false}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h4 className="text-base font-semibold text-slate-800 text-center mb-6">
                Quantidade de Itens por Armário
              </h4>

              <div className="w-full h-72 flex justify-left items-left">
                <ResponsiveContainer width="92%" height="100%">
                  <BarChart
                    data={cabinetStockData}
                    layout="vertical"
                    margin={{ top: 20, right: 40, left: 40, bottom: 10 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: "#1e293b" }}
                      axisLine={{ stroke: "#475569", strokeWidth: 1.2 }}
                      tickLine={{ stroke: "#475569" }}
                    />

                    <YAxis
                      type="category"
                      dataKey="cabinet"
                      tick={{ fontSize: 13, fill: "#1e293b" }}
                      width={90}
                      axisLine={{ stroke: "#475569", strokeWidth: 1.2 }}
                      tickLine={{ stroke: "#475569" }}
                    />

                    <defs>
                      <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                        <stop
                          offset="0%"
                          stopColor="#0284c7"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#0369a1"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#cbd5e1"
                    />

                    <Bar
                      dataKey="total"
                      fill="url(#barFill)"
                      barSize={28}
                      radius={[0, 6, 6, 0]}
                      isAnimationActive={true}
                      animationBegin={100}
                      animationDuration={1600}
                      animationEasing="ease-in-out"
                      label={{
                        position: "right",
                        fill: "#334155",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h4 className="text-base font-semibold text-slate-800 text-center mb-6">
                Proporção de Estoque
              </h4>
              <div className="flex flex-col lg:flex-row justify-center items-center gap-6 w-full">
                <div className="w-full lg:w-1/2 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockDistribution}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        activeIndex={activePieIndex ?? undefined}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                        isAnimationActive={true}
                        animationDuration={1000}
                        label={false}
                      >
                        {stockDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: string, props: any) => {
                          const { payload } = props;
                          return [`${payload.rawValue}`, "Quantidade"];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col text-sm text-slate-700 space-y-2">
                  {stockDistribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      ></span>
                      <span>
                        {item.name}: <b>{item.value}%</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
