import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  US_STATES,
  generateTasksForEmployee,
  generateExitTasks,
  type Employee,
  type ComplianceTask,
} from "@/lib/compliance-data";

export function useEmployees() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["employees", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapEmployee);
    },
    enabled: !!user,
  });
}

export function useStateHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["state_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useAddEmployee() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (form: { firstName: string; lastName: string; stateCode: string; hireDate: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Check existing employees in state
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("state_code", form.stateCode)
        .eq("status", "active");

      const existingInState = count ?? 0;

      // Insert employee
      const { data: emp, error } = await supabase
        .from("employees")
        .insert({
          user_id: user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          state_code: form.stateCode,
          work_state: US_STATES[form.stateCode] || form.stateCode,
          hire_date: form.hireDate,
          status: "active",
        })
        .select()
        .single();
      if (error) throw error;

      const employee = mapEmployee(emp);

      // Generate tasks
      const newTasks = generateTasksForEmployee(employee, existingInState);

      if (newTasks.length > 0) {
        const taskRows = newTasks.map((t) => ({
          user_id: user.id,
          employee_id: emp.id,
          employee_name: `${form.firstName} ${form.lastName}`,
          state_code: t.stateCode,
          state_name: t.stateName,
          title: t.title,
          description: t.description,
          due_date: t.dueDate,
          status: t.status,
          priority: t.priority,
          estimated_penalty: t.estimatedPenalty,
          category: t.category,
        }));
        await supabase.from("tasks").insert(taskRows);
      }

      // Activity logs
      const logs = [
        {
          user_id: user.id,
          action: "employee_added",
          entity_type: "employee",
          entity_id: emp.id,
          description: `${form.firstName} ${form.lastName} added to ${employee.workState}`,
        },
      ];
      if (newTasks.length > 0) {
        logs.push({
          user_id: user.id,
          action: "tasks_generated",
          entity_type: "task",
          entity_id: emp.id,
          description: `${newTasks.length} compliance tasks created for ${employee.workState}`,
        });
      }
      await supabase.from("activity_logs").insert(logs);

      return { employee, tasksCreated: newTasks.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}

export function useChangeEmployeeState() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      employeeId: string;
      newStateCode: string;
      effectiveDate: string;
      reason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current employee
      const { data: emp, error: empErr } = await supabase
        .from("employees")
        .select("*")
        .eq("id", params.employeeId)
        .single();
      if (empErr) throw empErr;

      const oldStateCode = emp.state_code;
      const oldStateName = emp.work_state;
      const newStateName = US_STATES[params.newStateCode] || params.newStateCode;
      const employee = mapEmployee(emp);

      // Insert state history
      await supabase.from("state_history").insert({
        user_id: user.id,
        employee_id: params.employeeId,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        previous_state: oldStateName,
        previous_state_code: oldStateCode,
        new_state: newStateName,
        new_state_code: params.newStateCode,
        effective_date: params.effectiveDate,
        reason: params.reason || null,
      });

      // Update employee
      await supabase
        .from("employees")
        .update({ state_code: params.newStateCode, work_state: newStateName })
        .eq("id", params.employeeId);

      // Generate exit tasks
      const exitTasks = generateExitTasks(employee, oldStateCode, params.effectiveDate);

      // Check if first in new state
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("state_code", params.newStateCode)
        .eq("status", "active")
        .neq("id", params.employeeId);

      const updatedEmployee: Employee = { ...employee, stateCode: params.newStateCode, workState: newStateName };
      const newStateTasks = (count ?? 0) === 0
        ? generateTasksForEmployee({ ...updatedEmployee, hireDate: params.effectiveDate }, 0)
        : [];

      const allNewTasks = [...exitTasks, ...newStateTasks];

      if (allNewTasks.length > 0) {
        const taskRows = allNewTasks.map((t) => ({
          user_id: user.id,
          employee_id: params.employeeId,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          state_code: t.stateCode,
          state_name: t.stateName,
          title: t.title,
          description: t.description,
          due_date: t.dueDate,
          status: t.status,
          priority: t.priority,
          estimated_penalty: t.estimatedPenalty,
          category: t.category,
        }));
        await supabase.from("tasks").insert(taskRows);
      }

      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "employee_state_changed",
        entity_type: "state_change",
        entity_id: params.employeeId,
        description: `${emp.first_name} ${emp.last_name} moved from ${oldStateName} to ${newStateName}`,
        metadata: { old: oldStateCode, new: params.newStateCode },
      });

      return { tasksCreated: allNewTasks.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
      qc.invalidateQueries({ queryKey: ["state_history"] });
    },
  });
}

function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    workState: row.work_state,
    stateCode: row.state_code,
    hireDate: row.hire_date,
    status: row.status,
    createdAt: row.created_at,
  };
}
