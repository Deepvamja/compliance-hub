import { addDays, differenceInDays, format, isWeekend, nextMonday } from "date-fns";

// ---- Types ----

export type TaskStatus = "pending" | "completed" | "overdue";
export type TaskPriority = "high" | "medium" | "low";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  workState: string;
  stateCode: string;
  hireDate: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: "employee" | "task" | "state_change";
  entityId: string;
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface StateHistoryEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  previousState: string;
  previousStateCode: string;
  newState: string;
  newStateCode: string;
  effectiveDate: string;
  reason?: string;
  createdAt: string;
}

export interface ComplianceTask {
  id: string;
  employeeId: string;
  employeeName: string;
  stateCode: string;
  stateName: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedPenalty: number;
  completedAt?: string;
  category: string;
  assignedTo?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  statesOperatingIn: number;
  overdueTasks: number;
  tasksDueThisWeek: number;
  totalPenaltyExposure: number;
  completionRate: number;
  tasksByState: { state: string; count: number }[];
  tasksByStatus: { status: string; count: number; fill: string }[];
}

// ---- State Data ----

export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

// ---- Compliance Requirements by State ----

interface ComplianceRequirement {
  title: string;
  description: string;
  dueDaysAfterHire: number;
  priority: TaskPriority;
  estimatedPenalty: number;
  category: string;
}

const STATE_REQUIREMENTS: Record<string, ComplianceRequirement[]> = {
  CA: [
    { title: "Register with CA EDD", description: "Register as employer with Employment Development Department", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 500, category: "Registration" },
    { title: "Obtain CA Employer ID", description: "Get California Employer Account Number from EDD", dueDaysAfterHire: 15, priority: "high", estimatedPenalty: 500, category: "Registration" },
    { title: "File CA New Hire Report", description: "Report new hire to CA Employment Development Department within 20 days", dueDaysAfterHire: 20, priority: "high", estimatedPenalty: 490, category: "Reporting" },
    { title: "Set up CA Workers Comp", description: "Obtain workers compensation insurance coverage for California", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 1000, category: "Insurance" },
    { title: "Post CA Labor Law Notices", description: "Display required California workplace posters", dueDaysAfterHire: 0, priority: "medium", estimatedPenalty: 200, category: "Compliance" },
    { title: "Register for CA SDI", description: "Register for State Disability Insurance program", dueDaysAfterHire: 30, priority: "medium", estimatedPenalty: 300, category: "Registration" },
    { title: "Set up CA PFL", description: "Set up Paid Family Leave withholding", dueDaysAfterHire: 30, priority: "medium", estimatedPenalty: 300, category: "Benefits" },
    { title: "File DE 9 Quarterly Report", description: "File quarterly wage and withholding report", dueDaysAfterHire: 90, priority: "medium", estimatedPenalty: 200, category: "Reporting" },
    { title: "Provide CA Wage Notice", description: "Provide written wage notice (Labor Code 2810.5) to employee", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 250, category: "Compliance" },
    { title: "Enroll in CA CalSavers", description: "Register for CalSavers retirement program if no plan offered", dueDaysAfterHire: 30, priority: "low", estimatedPenalty: 250, category: "Benefits" },
  ],
  TX: [
    { title: "Register with TWC", description: "Register with Texas Workforce Commission", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 400, category: "Registration" },
    { title: "File TX New Hire Report", description: "Report new hire to Texas Attorney General within 20 days", dueDaysAfterHire: 20, priority: "high", estimatedPenalty: 500, category: "Reporting" },
    { title: "Set up TX Workers Comp", description: "Obtain workers compensation or file non-subscriber notice", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 500, category: "Insurance" },
    { title: "Post TX Labor Law Notices", description: "Display required Texas workplace posters", dueDaysAfterHire: 0, priority: "medium", estimatedPenalty: 200, category: "Compliance" },
    { title: "Register for TX Unemployment", description: "Register for Texas unemployment insurance tax", dueDaysAfterHire: 15, priority: "high", estimatedPenalty: 400, category: "Registration" },
    { title: "File TX Employer Quarterly Report", description: "File quarterly wage report with TWC", dueDaysAfterHire: 90, priority: "medium", estimatedPenalty: 200, category: "Reporting" },
    { title: "Obtain TX Withholding ID", description: "No state income tax, but verify federal withholding setup", dueDaysAfterHire: 10, priority: "low", estimatedPenalty: 0, category: "Registration" },
    { title: "Set up TX Payday Law Compliance", description: "Establish compliant pay schedule per TX Payday Law", dueDaysAfterHire: 0, priority: "medium", estimatedPenalty: 300, category: "Compliance" },
  ],
  NY: [
    { title: "Register with NY DOL", description: "Register with New York Department of Labor", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 500, category: "Registration" },
    { title: "File NY New Hire Report", description: "Report new hire within 20 days to NY DOL", dueDaysAfterHire: 20, priority: "high", estimatedPenalty: 500, category: "Reporting" },
    { title: "Set up NY Workers Comp", description: "Obtain workers compensation coverage for New York", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 2000, category: "Insurance" },
    { title: "Register for NY DBL", description: "Set up NY Disability Benefits Law coverage", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 500, category: "Insurance" },
    { title: "Register for NY PFL", description: "Set up NY Paid Family Leave program", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 500, category: "Benefits" },
    { title: "Post NY Labor Law Notices", description: "Display all required New York workplace posters", dueDaysAfterHire: 0, priority: "medium", estimatedPenalty: 300, category: "Compliance" },
    { title: "Provide NY Wage Notice", description: "Provide written wage notice (Section 195.1) to employee", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 250, category: "Compliance" },
    { title: "Register for NY Withholding", description: "Register for NY state tax withholding", dueDaysAfterHire: 15, priority: "high", estimatedPenalty: 400, category: "Registration" },
    { title: "File NY-45 Quarterly Return", description: "File quarterly combined withholding return", dueDaysAfterHire: 90, priority: "medium", estimatedPenalty: 200, category: "Reporting" },
  ],
};

const DEFAULT_REQUIREMENTS: ComplianceRequirement[] = [
  { title: "Register as Employer", description: "Register with state labor department as employer", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 500, category: "Registration" },
  { title: "File New Hire Report", description: "Report new hire to state within 20 days", dueDaysAfterHire: 20, priority: "high", estimatedPenalty: 500, category: "Reporting" },
  { title: "Set up Workers Compensation", description: "Obtain workers compensation insurance", dueDaysAfterHire: 0, priority: "high", estimatedPenalty: 1000, category: "Insurance" },
  { title: "Post Labor Law Notices", description: "Display required workplace posters", dueDaysAfterHire: 0, priority: "medium", estimatedPenalty: 200, category: "Compliance" },
  { title: "Register for State Unemployment", description: "Register for state unemployment insurance tax", dueDaysAfterHire: 15, priority: "high", estimatedPenalty: 400, category: "Registration" },
  { title: "Register for State Withholding", description: "Register for state income tax withholding", dueDaysAfterHire: 15, priority: "high", estimatedPenalty: 400, category: "Registration" },
];

// Exit tasks when leaving a state
export const STATE_EXIT_TASKS: ComplianceRequirement[] = [
  { title: "File Final Wages Report", description: "File final wage report for departing state", dueDaysAfterHire: 30, priority: "high", estimatedPenalty: 500, category: "Reporting" },
  { title: "Close Unemployment Insurance Account", description: "Close state unemployment insurance account if no remaining employees", dueDaysAfterHire: 30, priority: "medium", estimatedPenalty: 200, category: "Registration" },
];

// ---- Utility Functions ----

export function calculateDueDate(hireDate: string, dueDaysAfterHire: number): string {
  let due = addDays(new Date(hireDate), dueDaysAfterHire);
  if (isWeekend(due)) {
    due = nextMonday(due);
  }
  return format(due, "yyyy-MM-dd");
}

export function getTaskStatus(dueDate: string, completed: boolean): TaskStatus {
  if (completed) return "completed";
  const today = format(new Date(), "yyyy-MM-dd");
  return dueDate < today ? "overdue" : "pending";
}

export function daysUntilDue(dueDate: string): number {
  return differenceInDays(new Date(dueDate), new Date());
}

export function daysUntilDueLabel(dueDate: string): string {
  const days = daysUntilDue(dueDate);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days} days`;
  return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""}`;
}

export function generateTasksForEmployee(
  employee: Employee,
  existingEmployeesInState: number
): ComplianceTask[] {
  if (existingEmployeesInState > 0) return [];

  const requirements = STATE_REQUIREMENTS[employee.stateCode] || DEFAULT_REQUIREMENTS;
  const stateName = US_STATES[employee.stateCode] || employee.stateCode;

  return requirements.map((req, i) => {
    const dueDate = calculateDueDate(employee.hireDate, req.dueDaysAfterHire);
    return {
      id: `task-${employee.id}-${i}`,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      stateCode: employee.stateCode,
      stateName,
      title: req.title,
      description: req.description,
      dueDate,
      status: getTaskStatus(dueDate, false),
      priority: req.priority,
      estimatedPenalty: req.estimatedPenalty,
      category: req.category,
    };
  });
}

export function generateExitTasks(
  employee: Employee,
  fromStateCode: string,
  effectiveDate: string
): ComplianceTask[] {
  const fromStateName = US_STATES[fromStateCode] || fromStateCode;
  return STATE_EXIT_TASKS.map((req, i) => {
    const dueDate = calculateDueDate(effectiveDate, req.dueDaysAfterHire);
    return {
      id: `exit-${employee.id}-${fromStateCode}-${i}-${Date.now()}`,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      stateCode: fromStateCode,
      stateName: fromStateName,
      title: `${req.title} in ${fromStateName}`,
      description: req.description,
      dueDate,
      status: getTaskStatus(dueDate, false),
      priority: req.priority,
      estimatedPenalty: req.estimatedPenalty,
      category: req.category,
    };
  });
}

export function exportTasksToCSV(tasks: ComplianceTask[]): string {
  const headers = ["Title", "State", "Employee", "Category", "Priority", "Status", "Due Date", "Penalty", "Completed At"];
  const rows = tasks.map((t) => [
    `"${t.title}"`,
    t.stateName,
    `"${t.employeeName}"`,
    t.category,
    t.priority,
    t.status,
    t.dueDate,
    t.estimatedPenalty.toString(),
    t.completedAt || "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ---- Seed Data ----

const seedEmployees: Employee[] = [
  { id: "emp-1", firstName: "Sarah", lastName: "Johnson", workState: "California", stateCode: "CA", hireDate: "2025-12-01", status: "active", createdAt: "2025-12-01" },
  { id: "emp-2", firstName: "Michael", lastName: "Chen", workState: "Texas", stateCode: "TX", hireDate: "2026-01-10", status: "active", createdAt: "2026-01-10" },
  { id: "emp-3", firstName: "Emily", lastName: "Rodriguez", workState: "New York", stateCode: "NY", hireDate: "2026-01-20", status: "active", createdAt: "2026-01-20" },
];

function buildSeedTasks(): ComplianceTask[] {
  const tasks: ComplianceTask[] = [];
  const stateCount: Record<string, number> = {};

  for (const emp of seedEmployees) {
    const count = stateCount[emp.stateCode] || 0;
    tasks.push(...generateTasksForEmployee(emp, count));
    stateCount[emp.stateCode] = count + 1;
  }

  tasks.slice(0, 3).forEach((t) => {
    t.status = "completed";
    t.completedAt = "2026-01-15";
  });

  return tasks;
}

function buildSeedActivityLog(): ActivityLogEntry[] {
  return [
    { id: "log-1", action: "employee_added", entityType: "employee", entityId: "emp-1", description: "Sarah Johnson added to California", createdAt: "2025-12-01T09:00:00Z" },
    { id: "log-2", action: "tasks_generated", entityType: "task", entityId: "emp-1", description: "10 compliance tasks created for California", createdAt: "2025-12-01T09:00:01Z" },
    { id: "log-3", action: "employee_added", entityType: "employee", entityId: "emp-2", description: "Michael Chen added to Texas", createdAt: "2026-01-10T10:00:00Z" },
    { id: "log-4", action: "tasks_generated", entityType: "task", entityId: "emp-2", description: "8 compliance tasks created for Texas", createdAt: "2026-01-10T10:00:01Z" },
    { id: "log-5", action: "employee_added", entityType: "employee", entityId: "emp-3", description: "Emily Rodriguez added to New York", createdAt: "2026-01-20T11:00:00Z" },
    { id: "log-6", action: "tasks_generated", entityType: "task", entityId: "emp-3", description: "9 compliance tasks created for New York", createdAt: "2026-01-20T11:00:01Z" },
    { id: "log-7", action: "task_completed", entityType: "task", entityId: "task-emp-1-0", description: "Register with CA EDD marked complete", createdAt: "2026-01-15T14:00:00Z" },
    { id: "log-8", action: "task_completed", entityType: "task", entityId: "task-emp-1-1", description: "Obtain CA Employer ID marked complete", createdAt: "2026-01-15T14:01:00Z" },
    { id: "log-9", action: "task_completed", entityType: "task", entityId: "task-emp-1-2", description: "File CA New Hire Report marked complete", createdAt: "2026-01-15T14:02:00Z" },
  ];
}

export const SEED_EMPLOYEES = seedEmployees;
export const SEED_TASKS = buildSeedTasks();
export const SEED_ACTIVITY_LOG = buildSeedActivityLog();
