import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingModal from "@/components/LoadingModal";
import EditableTable from "@/components/EditableTable";
import { api } from "@/api/canonical";
import { getMedicineRanking, getNonMovementProducts, getTodayNotifications, updateNotification } from "@/api/requests";
import { StockStatusItem, CabinetStockItem, StockDistributionItem, RecentMovement, MedicineRankingItem, RawMovement } from "@/interfaces/interfaces";
import NotificationReminderModal from "@/components/NotificationModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [noStock, setNoStock] = useState<number>(0);
  const [belowMin, setBelowMin] = useState<number>(0);
  const [expired, setExpired] = useState<number>(0);
  const [expiringSoon, setExpiringSoon] = useState<StockStatusItem[]>([]);
  const [cabinetStockData, setCabinetStockData] = useState<CabinetStockItem[]>([]);
  const [noStockData, setNoStockData] = useState<StockStatusItem[]>([]);
  const [belowMinData, setBelowMinData] = useState<StockStatusItem[]>([]);
  const [expiredData, setExpiredData] = useState<StockStatusItem[]>([]);
  const [expiringSoonData, setExpiringSoonData] = useState<StockStatusItem[]>([]);

  const [stockDistribution, setStockDistribution] = useState<StockDistributionItem[]>([]);

  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);

  const [mostMovData, setMostMovData] = useState<MedicineRankingItem[]>([]);
  const [leastMovData, setLeastMovData] = useState<MedicineRankingItem[]>([]);
  const [nonMovementProducts, setNonMovementProducts] = useState<any[]>([]);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          stockList,
          medicamentosMovRes,
          insumosMovRes,
          proportionRes,
          cabinetRes,
        ] = await Promise.all([
          api.get("/estoque?page=1&limit=800"),

          api.get("/movimentacoes/medicamentos", { params: { days: 7, page: 1, limit: 600 } }),
          api.get("/movimentacoes/insumos", { params: { days: 7, page: 1, limit: 600 } }),

          api.get("/estoque/proporcao"),
          api.get("/estoque", { params: { type: "armarios" } }),
        ]);

        const [medMoreRes, medLessRes, nonMovementRes] = await Promise.all([
            getMedicineRanking("more"),
            getMedicineRanking("less"),
            getNonMovementProducts()
        ]);


    const medicamentosMov = medicamentosMovRes.data ?? [];
        const insumosMov = insumosMovRes.data ?? [];

        const recentMovements = [
          ...medicamentosMov.map((m: RawMovement) => ({
            name: m.MedicineModel?.nome || "-",
            type: m.tipo,
            operator: m.LoginModel?.login || "-",
            casela: m.ResidentModel?.num_casela ?? "-",
            quantity: m.quantidade,
            patient: m.ResidentModel ? m.ResidentModel.nome : "-",
            cabinet: m.CabinetModel?.num_armario ?? "-",
            date: m.data,
          })),

          ...insumosMov.map((m: RawMovement) => ({
            name: m.InputModel?.nome || "-",
            type: m.tipo,
            operator: m.LoginModel?.login || "-",
            casela: m.ResidentModel?.num_casela ?? "-",
            quantity: m.quantidade,
            patient: m.ResidentModel ? m.ResidentModel.nome : "-",
            cabinet: m.CabinetModel?.num_armario ?? "-",
            date: m.data,
          })),
        ].sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

    const noStockItems = stockList.data.filter(i => i.st_quantidade === 'critical');

    const itemsInStockWarning = stockList.data.filter(i => i.st_quantidade === "low");

    const expiredItems = stockList.data.filter(i => i.st_expiracao === "expired" && i.quantidade > 0);

    const expiringSoonItems = stockList.data.filter(i =>
      i.st_expiracao === "warning" || i.st_expiracao === "critical" && i.quantidade > 0
    );

    setNoStock(noStockItems.length);
    setBelowMin(itemsInStockWarning.length);
    setExpired(expiredItems.length);
    setExpiringSoon(expiringSoonItems);
    setNoStockData(noStockItems);
    setBelowMinData(itemsInStockWarning);
    setExpiredData(expiredItems);
    setExpiringSoonData(expiringSoonItems);
    setRecentMovements(recentMovements);
    setNonMovementProducts(nonMovementRes);

    setMostMovData(
      medMoreRes.data.map(item => ({
        name: item.medicamento.nome,
        substance: item.medicamento.principio_ativo,
        total: item.total_movimentado,
        entradas: item.total_entradas,
        saidas: item.total_saidas,
      }))
    );

    setLeastMovData(
      medLessRes.data.map(item => ({
        name: item.medicamento.nome,
        substance: item.medicamento.principio_ativo,
        total: item.total_movimentado,
        entradas: item.total_entradas,
        saidas: item.total_saidas,
      }))
    );

    const { percentuais, totais } = proportionRes;

    setStockDistribution([
      { name: "Medicamentos em Estoque Geral", value: percentuais.medicamentos_geral, rawValue: totais.medicamentos_geral },
      { name: "Medicamentos em Estoque Individual", value: percentuais.medicamentos_individual, rawValue: totais.medicamentos_individual },
      { name: "Insumos em Estoque Geral", value: percentuais.insumos, rawValue: totais.insumos },
      { name: "Medicamentos no Carrinho", value: percentuais.carrinho_medicamentos, rawValue: totais.carrinho_medicamentos },
      { name: "Insumos no Carrinho", value: percentuais.carrinho_insumos, rawValue: totais.carrinho_insumos },
    ]);

    const formattedCabinetData = cabinetRes.data.map((arm: any) => ({
      cabinet: arm.armario_id,
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

  useEffect(() => {
    async function fetchReminders() {
      try {
        const res = await getTodayNotifications();

        const unseenNotifications = res.data.filter((n: any) => !n.visto);

        if (unseenNotifications.length > 0) {
          setNotifList(unseenNotifications);
          setNotifOpen(true);

          await Promise.all(
            unseenNotifications.map((n: any) =>
              updateNotification(n.id, { visto: true })
            )
          );
        }
      } catch (err) {
        console.error("Erro ao buscar notificações do dia", err);
      }
    }

    fetchReminders();
  }, []);

  const stats = [
    {
      label: "Itens Abaixo do Estoque Mínimo",
      value: noStock,
      onClick: () =>
        navigate("/stock", { state: { filter: "noStock", data: noStockData } }),
    },
    {
      label: "Itens Próximos do Estoque Mínimo",
      value: belowMin,
      onClick: () =>
        navigate("/stock", {
          state: { filter: "belowMin", data: belowMinData },
        }),
    },
    {
      label: "Itens Vencidos",
      value: expired,
      onClick: () =>
        navigate("/stock", { state: { filter: "expired", data: expiredData } }),
    },
    {
      label: "Itens com Vencimento Próximo",
      value: expiringSoon.length,

      onClick: () =>
        navigate("/stock", {
          state: { filter: "expiringSoon", data: expiringSoonData },
        }),
    },
  ];

  const COLORS = [
    "#0EA5E9",
    "#FACC15",
    "#EF4444",
    "#10B981", 
    "#8B5CF6", 
  ];

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
                <Card
                  key={index}
                  onClick={stat.onClick}
                  className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                >
                  <CardContent className="flex flex-col items-center py-8">
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      {stat.label}
                    </p>
                    <p className="text-5xl font-bold text-sky-700">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Produtos com Maior Tempo Sem Movimentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableTable
                  columns={[
                    { key: "nome", label: "Nome" },
                    { key: "detalhe", label: "Detalhe" },
                    { key: "tipo_item", label: "Tipo" },
                    { key: "dias_parados", label: "Dias Parados" },
                    { key: "ultima_movimentacao", label: "Última Movimentação" },
                  ]}
                  data={nonMovementProducts}
                  showAddons={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Movimentações Recentes
                </CardTitle>
              </CardHeader>

              <CardContent>
                <EditableTable
                  columns={[
                    { key: "name", label: "Produto" },
                    { key: "type", label: "Tipo" },
                    { key: "operator", label: "Operador" },
                    { key: "casela", label: "Casela" },
                    { key: "quantity", label: "Quantidade" },
                    { key: "patient", label: "Paciente" },
                    { key: "date", label: "Data da Movimentação" },
                  ]}
                  data={recentMovements}
                  showAddons={false}
                />
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Top 10 Mais Movimentados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableTable
                  columns={[
                    { key: "name", label: "Nome" },
                    { key: "substance", label: "Princípio Ativo" },
                    { key: "total", label: "Total" },
                    { key: "entradas", label: "Entradas" },
                    { key: "saidas", label: "Saídas" },
                  ]}
                  data={mostMovData}
                  showAddons={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Top 10 Menos Movimentados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableTable
                  columns={[
                    { key: "name", label: "Nome" },
                    { key: "substance", label: "Princípio Ativo" },
                    { key: "total", label: "Total" },
                    { key: "entradas", label: "Entradas" },
                    { key: "saidas", label: "Saídas" },
                  ]}
                  data={leastMovData}
                  showAddons={false}
                />
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Quantidade de Itens por Armário
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="w-full h-72 flex justify-center">
                  <ResponsiveContainer width="90%" height="100%">
                    <BarChart
                      data={cabinetStockData}
                      layout="vertical"
                      margin={{ top: 20, right: 40, left: 40, bottom: 10 }}
                    >
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="cabinet" width={80} />

                      <CartesianGrid strokeDasharray="3 3" />

                      <defs>
                        <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#0284c7" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                      </defs>

                      <Bar
                        dataKey="total"
                        fill="url(#barFill)"
                        radius={[0, 6, 6, 0]}
                        barSize={28}
                        label={{
                          position: "right",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Proporção de Estoque</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                  <div className="w-full lg:w-1/2 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockDistribution}
                          dataKey="value"
                          outerRadius={80}
                          activeIndex={activePieIndex ?? undefined}
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, i) => setActivePieIndex(i)}
                          onMouseLeave={() => setActivePieIndex(null)}
                        >
                          {stockDistribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(v: any, _n: string, p: any) => [
                            p.payload.rawValue,
                            "Quantidade",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    {stockDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i] }}
                        />
                        <span>
                          {item.name}: <b>{item.value}%</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      <NotificationReminderModal
        open={notifOpen}
        events={notifList}
        onClose={() => setNotifOpen(false)}
      />
    </Layout>
  );
}