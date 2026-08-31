import { useGetDashboardSummary, useGetMonthlyTrend, useGetByCategory, useGetRecentMovements, useGetProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, PieChart, Pie } from "recharts";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

const MESES_ES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

const MESES_LARGO: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

function formatMonthLabel(value: string) {
  const parts = value.split("-");
  if (parts.length === 2) {
    return MESES_ES[parts[1]] || value;
  }
  return value;
}

function formatMonthLong(value: string) {
  const parts = value.split("-");
  if (parts.length === 2) {
    return `${MESES_LARGO[parts[1]] || parts[1]} ${parts[0]}`;
  }
  return value;
}

export default function Dashboard() {
  const { data: profile } = useGetProfile();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: isLoadingTrend } = useGetMonthlyTrend();
  const { data: categoryBreakdown, isLoading: isLoadingBreakdown } = useGetByCategory({ type: "expense" });
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentMovements();

  const currency = profile?.currency || "COP";

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel General</h1>
            <p className="text-muted-foreground mt-1">Bienvenido, {profile?.name || "Usuario"}</p>
          </div>
          <Button asChild>
            <Link href="/movements/new">Nuevo Movimiento</Link>
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
              <WalletIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(summary?.balance || 0, currency)}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                  {formatCurrency(summary?.totalIncome || 0, currency)}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">
                  {formatCurrency(summary?.totalExpense || 0, currency)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Gráfica de tendencia */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
              <CardDescription>Ingresos y gastos de los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingTrend ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="month" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={formatMonthLabel}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value, currency)}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'var(--color-muted)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border p-2 rounded-md shadow-md">
                              <div className="font-semibold text-sm mb-1">
                                {formatMonthLong(payload[0].payload.month)}
                              </div>
                              <div className="text-emerald-600 text-sm">
                                Ingresos: {formatCurrency(payload[0].value as number, currency)}
                              </div>
                              <div className="text-rose-600 text-sm">
                                Gastos: {formatCurrency(payload[1].value as number, currency)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sin datos disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desglose por categoría */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>En qué gastaste este período</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {isLoadingBreakdown ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : categoryBreakdown && categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border p-2 rounded-md shadow-md">
                              <div className="font-semibold text-sm flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                {data.categoryName}
                              </div>
                              <div className="text-sm mt-1">
                                {formatCurrency(data.total, currency)} ({data.percentage}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="total"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sin datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Movimientos recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Tus últimas transacciones financieras</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/movements">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="space-y-6">
                {recent.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: movement.categoryColor || "hsl(var(--muted))" }}
                      >
                        {movement.type === "income" ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-none">{movement.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <span>{new Date(movement.date + "T12:00:00").toLocaleDateString("es-CO")}</span>
                          {movement.categoryName && (
                            <>
                              <span>•</span>
                              <span>{movement.categoryName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${movement.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-foreground'}`}>
                      {movement.type === "income" ? "+" : "-"}{formatCurrency(movement.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay movimientos recientes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
