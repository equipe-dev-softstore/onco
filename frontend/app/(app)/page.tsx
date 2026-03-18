"use client";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, AlertTriangle, Activity,
  FlaskConical, RadioTower, Stethoscope,
  CalendarDays,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";


/* ─── Tipos ─────────────────────────────────────────────── */

interface MetricGroup {
  total: number;
}

interface Stats {
  totalAtendimentos: number;
  pacientesAtendidos: number;
  taxaAbsenteismo: number;
  totalAtendimentosMesAtual: number;
  periodo: { year: number; month: number };
  primeiraVezQuimio: MetricGroup;
  primeiraVezRadio: MetricGroup;
  primeiraVezQuimioRadio: MetricGroup;
  emSeguimento: MetricGroup;
}

interface Charts {
  topCids: { cid: string; count: number }[];
  porTipoTratamento: { tipo: string; count: number }[];
  porEncaminhamento: { encaminhamento: string; count: number }[];
  volumeMensal: { mes: number; count: number }[];
}

/* ─── Card Simples ────────────────────────────────────────── */
function MetricCard({
  title,
  value,
  suffix,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      className={`border-l-4 ${color} shadow-sm bg-white dark:bg-slate-900`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">{title}</CardTitle>
        <div className="flex-shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-base font-normal text-muted-foreground ml-1">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Página Principal ───────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        apiFetch(`/dashboard/stats?year=${year}&month=${month}`),
        apiFetch(`/dashboard/charts?year=${year}&month=${month}`),
      ]);
      if (s?.success) setStats(s.data);
      if (c?.success) setCharts(c.data);
    } catch {
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { loadData(); }, [loadData]);

  const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#9333ea", "#4f46e5"];
  const mesLabel = (v: number) => new Date(0, v - 1).toLocaleString("pt-BR", { month: "short" });

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1e293b",
      color: "#f8fafc",
      border: "none",
      borderRadius: "8px",
      fontSize: "12px",
    },
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">Estatísticas de Atendimentos Oncológicos</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Ano Inteiro</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[year - 2, year - 1, year, year + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards principais */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Faixa 1 – Resumo Geral */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumo Geral</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total de Atendimentos (período)"
                value={stats?.totalAtendimentos ?? 0}
                icon={<FileText strokeWidth={2.5} className="h-4 w-4 text-blue-600" />}
                color="border-l-blue-600"
              />
              <MetricCard
                title="Atendimentos no Mês Atual"
                value={stats?.totalAtendimentosMesAtual ?? 0}
                icon={<CalendarDays strokeWidth={2.5} className="h-4 w-4 text-blue-400" />}
                color="border-l-blue-400"
              />
              <MetricCard
                title="Pacientes Atendidos (Estimativa)"
                value={stats?.pacientesAtendidos ?? 0}
                icon={<Activity strokeWidth={2.5} className="h-4 w-4 text-green-600" />}
                color="border-l-green-600"
              />
              <MetricCard
                title="Taxa de Absenteísmo"
                value={stats?.taxaAbsenteismo ?? 0}
                suffix="%"
                icon={<AlertTriangle strokeWidth={2.5} className="h-4 w-4 text-amber-500" />}
                color="border-l-amber-500"
              />
            </div>
          </div>

          {/* Faixa 2 – Primeira Vez */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Primeiros Atendimentos (1ª vez no tratamento)
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="1ª vez em Quimioterapia"
                value={stats?.primeiraVezQuimio.total ?? 0}
                icon={<FlaskConical strokeWidth={2.5} className="h-4 w-4 text-violet-600" />}
                color="border-l-violet-600"
              />
              <MetricCard
                title="1ª vez em Radioterapia"
                value={stats?.primeiraVezRadio.total ?? 0}
                icon={<RadioTower strokeWidth={2.5} className="h-4 w-4 text-orange-500" />}
                color="border-l-orange-500"
              />
              <MetricCard
                title="1ª vez em Quimio_Radio"
                value={stats?.primeiraVezQuimioRadio.total ?? 0}
                icon={<Activity strokeWidth={2.5} className="h-4 w-4 text-indigo-500" />}
                color="border-l-indigo-500"
              />
              <MetricCard
                title="Dando Seguimento (Controle / Paliativo)"
                value={stats?.emSeguimento.total ?? 0}
                icon={<Stethoscope strokeWidth={2.5} className="h-4 w-4 text-teal-600" />}
                color="border-l-teal-600"
              />
            </div>
          </div>
        </>
      )}

      {/* Gráficos */}
      {!loading && charts && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader><CardTitle className="text-sm">Volume de Atendimentos ({year})</CardTitle></CardHeader>
              <CardContent className="px-2">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.volumeMensal} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" fillOpacity={0.1} />
                      <XAxis dataKey="mes" tickFormatter={mesLabel} tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }} />
                      <YAxis tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }} />
                      <RechartsTooltip {...tooltipStyle} labelFormatter={(v) => mesLabel(Number(v))} />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Atendimentos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader><CardTitle className="text-sm">Top CIDs</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.topCids} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" fillOpacity={0.1} />
                      <XAxis type="number" tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }} />
                      <YAxis dataKey="cid" type="category" width={70} tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }} />
                      <RechartsTooltip {...tooltipStyle} />
                      <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} name="Atendimentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader><CardTitle className="text-sm">Atendimentos por Tipo de Tratamento</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[260px] w-full flex items-center justify-center">
                  {charts.porTipoTratamento?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.porTipoTratamento}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="tipo"
                        >
                          {charts.porTipoTratamento.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip {...tooltipStyle} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-muted-foreground text-sm">Sem dados</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader><CardTitle className="text-sm">Encaminhamentos</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.porEncaminhamento} margin={{ top: 5, right: 30, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" fillOpacity={0.1} />
                      <XAxis
                        dataKey="encaminhamento"
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fill: "currentColor", opacity: 0.7, fontSize: 11 }} />
                      <RechartsTooltip {...tooltipStyle} />
                      <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} name="Encaminhamentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
