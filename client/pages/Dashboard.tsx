import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Sector,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_PAGE_SIZE,
  fetchAllPaginated,
  paginate,
} from "@/helpers/paginacao.helper";

import EditableTable from "@/components/EditableTable";
import {
  getInputMovements,
  getMedicineMovements,
  getMedicineRanking,
  getNonMovementProducts,
  getStock,
  getStockProportions,
  getTodayNotifications,
  updateNotification,
} from "@/api/requests";
import {
  StockStatusItem,
  CabinetStockItem,
  StockDistributionItem,
  RecentMovement,
  MedicineRankingItem,
  RawMovement,
  DrawerStockItem,
} from "@/interfaces/interfaces";
import NotificationReminderModal from "@/components/NotificationModal";
import StockProportionCard from "@/components/StockProportionCard";
import { prepareStockDistributionData } from "@/helpers/estoque.helper";
import { SectorType } from "@/utils/enums";
import { useMaxSectionRows } from "@/hooks/use-max-selection-rows";

export default function Dashboard() {
  const navigate = useNavigate();

  const [noStock, setNoStock] = useState<number>(0);
  const [belowMin, setBelowMin] = useState<number>(0);
  const [expired, setExpired] = useState<number>(0);
  const [expiringSoon, setExpiringSoon] = useState<StockStatusItem[]>([]);
  const [cabinetStockData, setCabinetStockData] = useState<CabinetStockItem[]>(
    [],
  );
  const [drawerStockData, setDrawerStockData] = useState<DrawerStockItem[]>([]);
  const [noStockData, setNoStockData] = useState<StockStatusItem[]>([]);
  const [belowMinData, setBelowMinData] = useState<StockStatusItem[]>([]);
  const [expiredData, setExpiredData] = useState<StockStatusItem[]>([]);
  const [expiringSoonData, setExpiringSoonData] = useState<StockStatusItem[]>(
    [],
  );
  const [nonMovementPage, setNonMovementPage] = useState(1);
  const [recentMovementsPage, setRecentMovementsPage] = useState(1);

  const [nursingDistribution, setNursingDistribution] = useState<
    StockDistributionItem[]
  >([]);
  const [pharmacyDistribution, setPharmacyDistribution] = useState<
    StockDistributionItem[]
  >([]);

  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);

  const [mostMovData, setMostMovData] = useState<MedicineRankingItem[]>([]);
  const [leastMovData, setLeastMovData] = useState<MedicineRankingItem[]>([]);
  const [nonMovementProducts, setNonMovementProducts] = useState<any[]>([]);
  const [loadingNonMovement, setLoadingNonMovement] = useState(true);
  const [loadingRecentMovements, setLoadingRecentMovements] = useState(true);
  

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {      
        setLoadingNonMovement(true);
        setLoadingRecentMovements(true);
        const [
          stockList,
          medicamentosMov,
          insumosMov,
          nursingRes,
          pharmacyRes,
          cabinetRes,
          drawerRes,
        ] = await Promise.all([
          fetchAllPaginated((page, limit) =>
            getStock(page, limit).then((res) => res),
          ),

          fetchAllPaginated((page, limit) =>
            getMedicineMovements({ page, limit, days: 7 }).then((res) => res),
          ),

          fetchAllPaginated((page, limit) =>
            getInputMovements({ page, limit, days: 7 }).then((res) => res),
          ),

          getStockProportions("enfermagem"),
          getStockProportions("farmacia"),
          getStock(1, 10, "armarios"),
          getStock(1, 20, "gavetas"),
        ]);

        const [medMoreRes, medLessRes, nonMovementRes] = await Promise.all([
          getMedicineRanking("more"),
          getMedicineRanking("less"),
          getNonMovementProducts(),
        ]);

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

        const noStockItems = (stockList as any).filter(
          (i) => i.st_quantidade === "critical",
        );

        const itemsInStockWarning = (stockList as any).filter(
          (i) => i.st_quantidade === "low",
        );

        const expiredItems = (stockList as any).filter(
          (i) => i.st_expiracao === "expired" && i.quantidade > 0,
        );

        const expiringSoonItems = (stockList as any).filter(
          (i) =>
            i.st_expiracao === "warning" ||
            (i.st_expiracao === "critical" && i.quantidade > 0),
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
          medMoreRes.data.map((item) => ({
            name: item.medicamento.nome,
            substance: item.medicamento.principio_ativo,
            total: item.total_movimentado,
            entradas: item.total_entradas,
            saidas: item.total_saidas,
          })),
        );

        setLeastMovData(
          medLessRes.data.map((item) => ({
            name: item.medicamento.nome,
            substance: item.medicamento.principio_ativo,
            total: item.total_movimentado,
            entradas: item.total_entradas,
            saidas: item.total_saidas,
          })),
        );

        setNursingDistribution(
          prepareStockDistributionData(nursingRes, SectorType.ENFERMAGEM),
        );
        setPharmacyDistribution(
          prepareStockDistributionData(pharmacyRes, SectorType.FARMACIA),
        );

        const formattedCabinetData = cabinetRes.data.map((arm: any) => ({
          cabinet: arm.armario_id,
          total: Number(arm.total_geral) || 0,
        }));
        setCabinetStockData(formattedCabinetData);

        const formattedDrawerData = drawerRes.data.map((drawer: any) => ({
          drawer: drawer.gaveta_id,
          total: Number(drawer.total_geral) || 0,
        }));
        setDrawerStockData(formattedDrawerData);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
          setLoadingNonMovement(false);
          setLoadingRecentMovements(false);
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
              updateNotification(n.id, { visto: true }),
            ),
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

  const COLORS = ["#0EA5E9", "#FACC15", "#EF4444", "#10B981", "#8B5CF6"];

  const minRowsMovements = useMaxSectionRows(
    [nonMovementProducts, recentMovements],
    { min: DEFAULT_PAGE_SIZE },
  );

  return (
    <Layout>
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
                  {
                    key: "ultima_movimentacao",
                    label: "Última Movimentação",
                  },
                ]}
                data={paginate(nonMovementProducts, nonMovementPage)}
                showAddons={false}
                minRows={minRowsMovements}
                loading={loadingNonMovement}
              />
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  disabled={nonMovementPage === 1}
                  onClick={() => setNonMovementPage((p) => p - 1)}
                >
                  Anterior
                </button>

                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  disabled={
                    nonMovementPage * DEFAULT_PAGE_SIZE >=
                    nonMovementProducts.length
                  }
                  onClick={() => setNonMovementPage((p) => p + 1)}
                >
                  Próximo
                </button>
              </div>
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
                  { key: "casela", label: "Casela" },
                  { key: "quantity", label: "Quantidade" },
                  { key: "patient", label: "Paciente" },
                  { key: "date", label: "Data" },
                ]}
                data={paginate(recentMovements, recentMovementsPage)}
                minRows={minRowsMovements}
                showAddons={false}
                loading={loadingRecentMovements}
              />
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  disabled={recentMovementsPage === 1}
                  onClick={() => setRecentMovementsPage((p) => p - 1)}
                >
                  Anterior
                </button>

                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  disabled={
                    recentMovementsPage * DEFAULT_PAGE_SIZE >=
                    recentMovements.length
                  }
                  onClick={() => setRecentMovementsPage((p) => p + 1)}
                >
                  Próximo
                </button>
              </div>
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
                      <linearGradient
                        id="barFillCabinet"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#0369a1" />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="total"
                      fill="url(#barFillCabinet)"
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
              <CardTitle className="text-center">
                Quantidade de Itens por Gaveta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-72 flex justify-center">
                <ResponsiveContainer width="90%" height="100%">
                  <BarChart
                    data={drawerStockData}
                    layout="vertical"
                    margin={{ top: 20, right: 40, left: 40, bottom: 10 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="drawer" width={80} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <defs>
                      <linearGradient
                        id="barFillDrawer"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="total"
                      fill="url(#barFillDrawer)"
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
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockProportionCard
            title="Proporção de Estoque da Farmácia"
            data={pharmacyDistribution}
            colors={COLORS}
          />

          <StockProportionCard
            title="Proporção de Estoque da Enfermagem"
            data={nursingDistribution}
            colors={COLORS}
          />
        </section>
      </div>

      <NotificationReminderModal
        open={notifOpen}
        events={notifList}
        onClose={() => setNotifOpen(false)}
      />
    </Layout>
  );
}
