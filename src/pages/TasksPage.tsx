import { useState } from "react";
import { useTasks, useToggleTaskComplete, useBulkCompleteTasks } from "@/hooks/use-tasks";
import { daysUntilDueLabel, US_STATES, exportTasksToCSV, type TaskStatus, type TaskPriority } from "@/lib/compliance-data";
import { CheckCircle2, Circle, Search, Download, Square, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<TaskStatus, string> = {
  completed: "status-completed",
  pending: "status-pending",
  overdue: "status-overdue",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-overdue/10 text-overdue",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

export default function TasksPage() {
  const { data: tasks = [] } = useTasks();
  const toggleMut = useToggleTaskComplete();
  const bulkMut = useBulkCompleteTasks();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = tasks.filter((t) => {
    if (stateFilter !== "all" && t.stateCode !== stateFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.employeeName.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const states = [...new Set(tasks.map((t) => t.stateCode))];

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((t) => t.id)));
    }
  }

  async function handleBulkComplete() {
    const ids = Array.from(selectedIds);
    await bulkMut.mutateAsync(ids);
    toast({ title: "Tasks completed", description: `${ids.length} tasks marked complete.` });
    setSelectedIds(new Set());
  }

  function handleExportCSV() {
    const csv = exportTasksToCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-tasks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} tasks exported to CSV.` });
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Showing {filtered.length} of {tasks.length} tasks
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button size="sm" onClick={handleBulkComplete} disabled={bulkMut.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete {selectedIds.size}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative max-w-xs flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => (
              <SelectItem key={s} value={s}>{US_STATES[s]} ({s})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length > 0 && (
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {selectedIds.size === sorted.length ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          {selectedIds.size === sorted.length ? "Deselect all" : "Select all"}
        </button>
      )}

      <div className="grid gap-2">
        {sorted.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">No tasks match your filters.</p>
        )}
        {sorted.map((task) => (
          <Card key={task.id} className={cn("shadow-sm transition-all", task.status === "completed" && "opacity-60")}>
            <CardContent className="flex items-center gap-3 p-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(task.id);
                }}
                className="shrink-0"
              >
                {selectedIds.has(task.id) ? (
                  <CheckSquare className="h-4 w-4 text-sidebar-ring" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMut.mutate(task.id);
                }}
                className="shrink-0 hover:scale-110 transition-transform"
                title={task.status === "completed" ? "Mark incomplete" : "Mark complete"}
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <p className={cn("text-sm font-medium", task.status === "completed" && "line-through")}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {task.stateName} · {task.employeeName} · {task.category}
                  {task.assignedTo && ` · Assigned: ${task.assignedTo}`}
                </p>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={cn("text-[10px] font-semibold border-0", PRIORITY_STYLES[task.priority])}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] font-semibold border-0", STATUS_STYLES[task.status])}>
                  {task.status === "completed" ? "Done" : daysUntilDueLabel(task.dueDate)}
                </Badge>
                {task.estimatedPenalty > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium">${task.estimatedPenalty}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
