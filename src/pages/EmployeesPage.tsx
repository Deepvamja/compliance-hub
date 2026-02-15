import { useState } from "react";
import { useEmployees, useStateHistory, useAddEmployee, useChangeEmployeeState } from "@/hooks/use-employees";
import { US_STATES } from "@/lib/compliance-data";
import { Plus, Search, ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function EmployeesPage() {
  const { data: employees = [] } = useEmployees();
  const { data: stateHistory = [] } = useStateHistory();
  const addEmployeeMut = useAddEmployee();
  const changeStateMut = useChangeEmployeeState();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [stateChangeOpen, setStateChangeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", stateCode: "", hireDate: "" });
  const [stateForm, setStateForm] = useState({ newStateCode: "", effectiveDate: "", reason: "" });

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.workState.toLowerCase().includes(q)
    );
  });

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.stateCode || !form.hireDate) return;

    try {
      const result = await addEmployeeMut.mutateAsync(form);
      toast({
        title: "Employee added!",
        description: result.tasksCreated > 0
          ? `${result.tasksCreated} compliance tasks created for ${US_STATES[form.stateCode]}.`
          : `${result.employee.firstName} added. No new state tasks needed.`,
      });
      setForm({ firstName: "", lastName: "", stateCode: "", hireDate: "" });
      setAddOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  async function handleStateChange(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmployeeId || !stateForm.newStateCode || !stateForm.effectiveDate) return;

    try {
      const result = await changeStateMut.mutateAsync({
        employeeId: selectedEmployeeId,
        newStateCode: stateForm.newStateCode,
        effectiveDate: stateForm.effectiveDate,
        reason: stateForm.reason || undefined,
      });
      toast({
        title: "State changed!",
        description: `${result.tasksCreated} new compliance tasks created.`,
      });
      setStateForm({ newStateCode: "", effectiveDate: "", reason: "" });
      setStateChangeOpen(false);
      setSelectedEmployeeId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  function openStateChange(empId: string) {
    setSelectedEmployeeId(empId);
    setStateChangeOpen(true);
  }

  function getEmployeeHistory(empId: string) {
    return stateHistory.filter((h: any) => h.employee_id === empId);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">{employees.length} total employees</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Sarah"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Johnson"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Work State</Label>
                <Select value={form.stateCode} onValueChange={(v) => setForm({ ...form, stateCode: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(US_STATES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name} ({code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hire Date</Label>
                <Input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={addEmployeeMut.isPending}>
                {addEmployeeMut.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={stateChangeOpen} onOpenChange={setStateChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change State</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <form onSubmit={handleStateChange} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Current State</Label>
                <Input value={`${selectedEmployee.workState} (${selectedEmployee.stateCode})`} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>New State</Label>
                <Select value={stateForm.newStateCode} onValueChange={(v) => setStateForm({ ...stateForm, newStateCode: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(US_STATES)
                      .filter(([code]) => code !== selectedEmployee.stateCode)
                      .map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name} ({code})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={stateForm.effectiveDate}
                  onChange={(e) => setStateForm({ ...stateForm, effectiveDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Textarea
                  value={stateForm.reason}
                  onChange={(e) => setStateForm({ ...stateForm, reason: e.target.value })}
                  placeholder="Employee relocated"
                />
              </div>
              <Button type="submit" className="w-full" disabled={changeStateMut.isPending}>
                {changeStateMut.isPending ? "Processing..." : "Confirm State Change"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">No employees found.</p>
        )}
        {filtered.map((emp) => {
          const history = getEmployeeHistory(emp.id);
          return (
            <Card key={emp.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.workState} · Hired {emp.hireDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => openStateChange(emp.id)}
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" /> Change State
                    </Button>
                    <Badge className="bg-success/10 text-success border-0 capitalize">
                      {emp.status}
                    </Badge>
                  </div>
                </div>
                {history.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">State History</p>
                    {history.map((h: any) => (
                      <p key={h.id} className="text-xs text-muted-foreground">
                        {h.previous_state} → {h.new_state} on {h.effective_date}
                        {h.reason && ` · ${h.reason}`}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
