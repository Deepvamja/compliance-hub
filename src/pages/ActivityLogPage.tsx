import { useActivityLog } from "@/hooks/use-activity-log";
import { format } from "date-fns";
import { Activity, Users, ClipboardCheck, ArrowRightLeft, Paperclip, MessageSquare, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ACTION_ICONS: Record<string, typeof Activity> = {
  employee_added: Users,
  tasks_generated: ClipboardCheck,
  task_completed: ClipboardCheck,
  task_reopened: ClipboardCheck,
  employee_state_changed: ArrowRightLeft,
  file_uploaded: Paperclip,
  comment_added: MessageSquare,
  task_assigned: UserCheck,
};

const ACTION_COLORS: Record<string, string> = {
  employee_added: "text-sidebar-ring",
  tasks_generated: "text-warning",
  task_completed: "text-success",
  task_reopened: "text-warning",
  employee_state_changed: "text-sidebar-ring",
  file_uploaded: "text-muted-foreground",
  comment_added: "text-muted-foreground",
  task_assigned: "text-sidebar-ring",
};

export default function ActivityLogPage() {
  const { data: activityLog = [] } = useActivityLog();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground text-sm mt-1">Audit trail of all actions ({activityLog.length} entries)</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {activityLog.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No activity yet.</p>
          ) : (
            <div className="divide-y">
              {activityLog.map((entry) => {
                const Icon = ACTION_ICONS[entry.action] || Activity;
                const color = ACTION_COLORS[entry.action] || "text-muted-foreground";
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-4">
                    <div className={`mt-0.5 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{entry.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium capitalize shrink-0">
                      {entry.action.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
