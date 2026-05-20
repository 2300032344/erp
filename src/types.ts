export interface LedgerEntry {
  id: string;
  date: string;
  accountCode: string;
  accountName: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  currency: string;
  description: string;
  postedBy: string;
}

export interface InvoiceLineItem {
  desc: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  vendor: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  ocrConfidence: number;
  status: "PENDING_MATCH" | "APPROVED" | "PAID" | "FLAGGED";
  lineItems: InvoiceLineItem[];
  poMatchedId?: string;
  agingCategory: "0-30 days" | "31-60 days" | "61-90 days" | "90+ days";
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: "Engineering" | "Finance" | "Sales" | "HR" | "Operations";
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
  email: string;
  baseSalary: number;
  accruedLeaves: number;
  leavesTaken: number;
  recentPayrollPaid: boolean;
}

export interface SKU {
  id: string;
  name: string;
  category: "Chips" | "Fiber Nodes" | "System Bays" | "Controllers";
  currentStock: number;
  reorderPoint: number;
  unitCost: number;
  supplier: string;
  historicalDemand30d: number[];
  forecastDemand30d: number[];
}

export interface ProjectTask {
  id: string;
  name: string;
  status: "DONE" | "TODO";
  start: string;
  end: string;
  progress: number;
  dept: string;
}

export interface Project {
  id: string;
  name: string;
  lead: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "OVERRUN_ALERT";
  budget: number;
  actualSpent: number;
  tasks: ProjectTask[];
}

export interface AuditLog {
  sequence: number;
  timestamp: string;
  eventType: string;
  module: string;
  actor: string;
  description: string;
  txHash: string;
  prevHash: string;
}

export interface CopilotResponse {
  reply: string;
  simulated?: boolean;
}

export interface AuditVerificationResult {
  isValid: boolean;
  totalSequenceChecked: number;
  timestamp: string;
  governingAuthority: string;
  failures: Array<{ seq: number; expected: string; actual: string }>;
}
