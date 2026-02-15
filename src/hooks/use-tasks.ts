import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getTaskStatus, type ComplianceTask, type TaskPriority } from "@/lib/compliance-data";

export function useTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapTask);
    },
    enabled: !!user,
  });
}

export function useToggleTaskComplete() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: task, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      if (error) throw error;

      const nowCompleting = task.status !== "completed";
      const newStatus = nowCompleting
        ? "completed"
        : getTaskStatus(task.due_date, false);

      await supabase
        .from("tasks")
        .update({
          status: newStatus,
          completed_at: nowCompleting ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: nowCompleting ? "task_completed" : "task_reopened",
        entity_type: "task",
        entity_id: taskId,
        description: `${task.title} ${nowCompleting ? "marked complete" : "reopened"}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}

export function useBulkCompleteTasks() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      if (!user) throw new Error("Not authenticated");

      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, status")
        .in("id", taskIds);

      const toComplete = (tasks ?? []).filter((t) => t.status !== "completed");

      if (toComplete.length > 0) {
        await supabase
          .from("tasks")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .in("id", toComplete.map((t) => t.id));

        const logs = toComplete.map((t) => ({
          user_id: user.id,
          action: "task_completed",
          entity_type: "task",
          entity_id: t.id,
          description: `${t.title} marked complete (bulk)`,
        }));
        await supabase.from("activity_logs").insert(logs);
      }

      return toComplete.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}

export function useUpdateTaskPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, priority }: { taskId: string; priority: TaskPriority }) => {
      await supabase.from("tasks").update({ priority }).eq("id", taskId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAssignTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, assignee }: { taskId: string; assignee: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("tasks").update({ assigned_to: assignee }).eq("id", taskId);
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "task_assigned",
        entity_type: "task",
        entity_id: taskId,
        description: `Task assigned to ${assignee}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}

export function useAddComment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, author, text }: { taskId: string; author: string; text: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("task_comments").insert({
        user_id: user.id,
        task_id: taskId,
        author,
        text,
      });
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "comment_added",
        entity_type: "task",
        entity_id: taskId,
        description: `Comment added by ${author}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task_comments"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}

export function useTaskComments(taskId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["task_comments", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!taskId,
  });
}

function mapTask(row: any): ComplianceTask {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    stateCode: row.state_code,
    stateName: row.state_name,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    priority: row.priority,
    estimatedPenalty: row.estimated_penalty,
    completedAt: row.completed_at,
    category: row.category,
    assignedTo: row.assigned_to,
  };
}
