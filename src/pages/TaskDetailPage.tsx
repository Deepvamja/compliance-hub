import { useParams, useNavigate } from "react-router-dom";
import { useTasks, useToggleTaskComplete, useUpdateTaskPriority, useAssignTask, useAddComment, useTaskComments } from "@/hooks/use-tasks";
import { daysUntilDueLabel } from "@/lib/compliance-data";
import { ArrowLeft, CheckCircle2, Circle, Paperclip, Send, FileText, Image, Download, User, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";

const STATUS_STYLES = {
  completed: "status-completed",
  pending: "status-pending",
  overdue: "status-overdue",
};

const PRIORITY_STYLES = {
  high: "bg-overdue/10 text-overdue",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: tasks = [] } = useTasks();
  const { data: taskComments = [] } = useTaskComments(taskId);
  const toggleMut = useToggleTaskComplete();
  const priorityMut = useUpdateTaskPriority();
  const assignMut = useAssignTask();
  const commentMut = useAddComment();

  const task = tasks.find((t) => t.id === taskId);

  const [commentText, setCommentText] = useState("");
  const [assignee, setAssignee] = useState(task?.assignedTo || "");

  if (!task) {
    return (
      <div className="p-6 lg:p-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tasks
        </Button>
        <p className="mt-8 text-center text-muted-foreground">Task not found.</p>
      </div>
    );
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    commentMut.mutate({ taskId: task!.id, author: "You", text: commentText.trim() });
    setCommentText("");
    toast({ title: "Comment added" });
  }

  function handleAssign() {
    if (!assignee.trim()) return;
    assignMut.mutate({ taskId: task!.id, assignee: assignee.trim() });
    toast({ title: "Task assigned", description: `Assigned to ${assignee}` });
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tasks
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button onClick={() => toggleMut.mutate(task.id)} className="shrink-0">
              {task.status === "completed" ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <h1 className={cn("text-2xl font-bold tracking-tight", task.status === "completed" && "line-through opacity-60")}>
              {task.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("border-0", STATUS_STYLES[task.status])}>{task.status}</Badge>
            <Badge className={cn("border-0", PRIORITY_STYLES[task.priority])}>{task.priority} priority</Badge>
            <Badge variant="outline">{task.category}</Badge>
          </div>
        </div>
        <Button
          onClick={() => toggleMut.mutate(task.id)}
          variant={task.status === "completed" ? "outline" : "default"}
          size="sm"
        >
          {task.status === "completed" ? "Reopen" : "Mark Complete"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comments ({taskComments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskComments.length > 0 && (
                <div className="space-y-3">
                  {taskComments.map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                        {c.author[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.author}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[60px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim() || commentMut.isPending}>
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">{format(new Date(task.dueDate), "MMM d, yyyy")}</p>
                  <p className={cn(
                    "text-xs font-medium",
                    task.status === "overdue" ? "text-overdue" : task.status === "completed" ? "text-success" : "text-warning"
                  )}>
                    {task.status === "completed" ? "Completed" : daysUntilDueLabel(task.dueDate)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p className="text-sm font-medium">{task.stateName} ({task.stateCode})</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="text-sm font-medium">{task.employeeName}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Est. Penalty</p>
                  <p className="text-sm font-medium">${task.estimatedPenalty.toLocaleString()}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={task.priority} onValueChange={(v) => priorityMut.mutate({ taskId: task.id, priority: v as any })}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div>
                <Label className="text-xs">Assign To</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Name..."
                    className="h-8 text-xs"
                  />
                  <Button size="sm" variant="outline" className="h-8 text-xs px-2" onClick={handleAssign}>
                    Assign
                  </Button>
                </div>
                {task.assignedTo && (
                  <p className="text-xs text-muted-foreground mt-1">Currently: {task.assignedTo}</p>
                )}
              </div>
              {task.completedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Completed At</p>
                    <p className="text-sm font-medium">{format(new Date(task.completedAt), "MMM d, yyyy h:mm a")}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
