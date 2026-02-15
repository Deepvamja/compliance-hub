import { useEmployees } from "@/hooks/use-employees";
import { useTasks } from "@/hooks/use-tasks";
import { daysUntilDue } from "@/lib/compliance-data";
import { Users, MapPin, AlertTriangle, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

const PIE_COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
];

export default function DashboardPage() {
  const { data: employees = [] } = useEmployees();
  const { data: tasks = [] } = useTasks();
  const navigate = useNavigate();

  const activeEmployees = employees.filter((e) => e.status === "active");
  const uniqueStates = new Set(activeEmployees.map((e) => e.stateCode));
  const overdue = tasks.filter((t) => t.status === "overdue");
  const dueThisWeek = tasks.filter((t) => {
    const d = daysUntilDue(t.dueDate);
    return d >= 0 && d <= 7 && t.status !== "completed";
  });
  const completed = tasks.filter((t) => t.status === "completed");
  const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
  const penaltyExposure = overdue.reduce((s, t) => s + t.estimatedPenalty, 0);

  const tasksByState = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.stateCode] = (acc[t.stateCode] || 0) + 1;
      return acc;
    }, {})
  ).map(([state, count]) => ({ state, count }));

  const tasksByStatus = [
    { status: "Completed", count: completed.length, fill: PIE_COLORS[0] },
    { status: "Pending", count: tasks.filter((t) => t.status === "pending").length, fill: PIE_COLORS[1] },
    { status: "Overdue", count: overdue.length, fill: PIE_COLORS[2] },
  ];

  const upcoming = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const stats = [
    { label: "Total Employees", value: activeEmployees.length, icon: Users, accent: "text-sidebar-ring" },
    { label: "States Operating In", value: uniqueStates.size, icon: MapPin, accent: "text-success" },
    { label: "Overdue Tasks", value: overdue.length, icon: AlertTriangle, accent: "text-overdue" },
    { label: "Due This Week", value: dueThisWeek.length, icon: Clock, accent: "text-warning" },
    { label: "Penalty Exposure", value: `$${penaltyExposure.toLocaleString()}`, icon: DollarSign, accent: "text-overdue" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle2, accent: "text-success" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Compliance overview across all states</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.accent}`} />
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks by State</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tasksByState}>
                <XAxis dataKey="state" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(222, 47%, 11%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No upcoming tasks</p>
          ) : (
            <div className="divide-y">
              {upcoming.map((task) => {
                const days = daysUntilDue(task.dueDate);
                return (
                  <button
                    key={task.id}
                    onClick={() => navigate("/tasks")}
                    className="flex items-center justify-between w-full py-3 text-left hover:bg-muted/50 px-2 rounded transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.stateName} · {task.employeeName}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-3 ${
                        days < 0
                          ? "status-overdue"
                          : days <= 7
                          ? "status-pending"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
