import { useMemo, useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const STATUS_DOT: Record<string, string> = {
  completed: "bg-success",
  pending: "bg-warning",
  overdue: "bg-overdue",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: tasks = [] } = useTasks();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((t) => {
      const key = t.dueDate;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const today = new Date();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Compliance deadlines overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2 border-r last:border-r-0">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[100px] border-r border-b bg-muted/30" />
            ))}

            {allDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate[dateKey] || [];
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "min-h-[100px] border-r border-b p-1.5 last:border-r-0",
                    isToday && "bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isToday ? "text-sidebar-ring font-bold" : "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className={cn(
                          "w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate flex items-center gap-1",
                          "hover:opacity-80 transition-opacity",
                          task.status === "completed" ? "bg-success/10 text-success" :
                          task.status === "overdue" ? "bg-overdue/10 text-overdue" :
                          "bg-warning/10 text-warning"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[task.status])} />
                        <span className="truncate">{task.title}</span>
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
