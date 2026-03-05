import { useMemo, useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar } from "~/components/ui/avatar";
import { useDashboard } from "~/contexts/DashboardContext";
import { formatRelativeTime, formatCurrency } from "~/lib/format";
import { Users, UserCheck, DollarSign, Send } from "lucide-react";

function useCountUp(target: number, durationMs = 800) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    const startVal = prevTarget.current;
    prevTarget.current = target;
    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const easeOut = 1 - (1 - t) * (1 - t);
      setCurrent(Math.round(startVal + (target - startVal) * easeOut));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, durationMs]);
  return current;
}

export function Overview() {
  const { employees, transfers } = useDashboard();

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === "active"),
    [employees]
  );
  const totalPayroll = useMemo(
    () => activeEmployees.reduce((s, e) => s + e.salary, 0),
    [activeEmployees]
  );
  const totalTransferred = useMemo(
    () => transfers.reduce((s, t) => s + t.amount, 0),
    [transfers]
  );

  const departmentData = useMemo(() => {
    const byDept: Record<string, number> = {};
    activeEmployees.forEach((e) => {
      byDept[e.department] = (byDept[e.department] ?? 0) + e.salary;
    });
    return Object.entries(byDept).map(([name, total]) => ({ name, total }));
  }, [activeEmployees]);

  const payrollTrend = useMemo(() => {
    const months: { month: string; payroll: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        payroll: totalPayroll,
      });
    }
    return months;
  }, [totalPayroll]);

  const recentTransfers = useMemo(
    () => [...transfers].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
    [transfers]
  );
  const recentHires = useMemo(
    () =>
      [...employees]
        .sort((a, b) => b.hireDate.localeCompare(a.hireDate))
        .slice(0, 4),
    [employees]
  );

  const countTotal = useCountUp(employees.length);
  const countActive = useCountUp(activeEmployees.length);
  const countPayroll = useCountUp(totalPayroll, 1000);
  const countTransferred = useCountUp(totalTransferred, 1000);

  const stats = [
    {
      label: "Total Employees",
      value: countTotal,
      icon: Users,
      gradient: "from-blue-500/20 to-blue-600/5",
    },
    {
      label: "Active Employees",
      value: countActive,
      icon: UserCheck,
      gradient: "from-emerald-500/20 to-emerald-600/5",
    },
    {
      label: "Monthly Payroll",
      value: formatCurrency(countPayroll),
      icon: DollarSign,
      gradient: "from-amber-500/20 to-amber-600/5",
    },
    {
      label: "Total Transferred",
      value: formatCurrency(countTransferred),
      icon: Send,
      gradient: "from-violet-500/20 to-violet-600/5",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your payroll and team at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, gradient }) => (
          <Card
            key={label}
            className="overflow-hidden border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur dark:bg-zinc-950/30 shadow-sm"
          >
            <CardContent className="pt-6">
              <div className={`rounded-lg bg-gradient-to-br ${gradient} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {label}
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {value}
                    </p>
                  </div>
                  <Icon className="size-8 text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur dark:bg-zinc-950/30 shadow-sm">
          <CardHeader>
            <CardTitle className="section-header">
              Monthly payroll trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payrollTrend}>
                  <defs>
                    <linearGradient id="fillPayroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "currentColor" }} />
                  <YAxis className="text-xs" tick={{ fill: "currentColor" }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v: number | undefined) => [formatCurrency(v ?? 0), "Payroll"]} />
                  <Area
                    type="monotone"
                    dataKey="payroll"
                    stroke="var(--color-primary)"
                    fill="url(#fillPayroll)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur dark:bg-zinc-950/30 shadow-sm">
          <CardHeader>
            <CardTitle className="section-header">
              Department salary distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} className="text-xs" />
                  <YAxis type="category" dataKey="name" width={80} className="text-xs" tick={{ fill: "currentColor" }} />
                  <Tooltip formatter={(v: number | undefined) => [formatCurrency(v ?? 0), "Total"]} />
                  <Bar dataKey="total" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur dark:bg-zinc-950/30 shadow-sm">
          <CardHeader>
            <CardTitle className="section-header">Recent transfers</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransfers.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">No transfers yet. Run a payment from Employees or Transfers to see activity here.</p>
            ) : (
              <ul className="space-y-3">
                {recentTransfers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-md border border-zinc-200/70 dark:border-zinc-800/70 py-2 px-3 bg-zinc-50/50 dark:bg-zinc-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={t.to.name} className="size-8" />
                      <div>
                        <p className="text-sm font-medium">{t.to.name}</p>
                        <p className="caption">{formatRelativeTime(t.timestamp)}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur dark:bg-zinc-950/30 shadow-sm">
          <CardHeader>
            <CardTitle className="section-header">Recent hires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {recentHires.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-md border border-zinc-200/70 dark:border-zinc-800/70 p-3 bg-zinc-50/50 dark:bg-zinc-900/30"
                >
                  <Avatar name={e.name} className="size-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{e.name}</p>
                    <p className="caption truncate">{e.role}</p>
                  </div>
                </div>
              ))}
            </div>
            {recentHires.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">No team members yet. Add your first employee to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
