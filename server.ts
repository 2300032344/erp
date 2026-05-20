import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createHash } from "node:crypto";

dotenv.config();

const PORT = 3000;

// ==========================================
// 1. IN-MEMORY DATABASE SCHEMA & SEED DATA
// ==========================================

// Double-Entry Ledger (F-02)
interface LedgerEntry {
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

const initialLedger: LedgerEntry[] = [
  { id: "TX-1001", date: "2026-05-10", accountCode: "1010", accountName: "Cash & Equivalents", type: "DEBIT", amount: 250000, currency: "USD", description: "SaaS Subscription Revenue Receipt", postedBy: "AR-Bot-01" },
  { id: "TX-1002", date: "2026-05-10", accountCode: "4000", accountName: "Software Sales Revenue", type: "CREDIT", amount: 250000, currency: "USD", description: "Enterprise Cloud Subscription Sales", postedBy: "AR-Bot-01" },
  { id: "TX-1003", date: "2026-05-12", accountCode: "5020", accountName: "R&D Cloud Overhead", type: "DEBIT", amount: 45000, currency: "USD", description: "AWS/GCP Production Node Billing", postedBy: "AP-Bot-02" },
  { id: "TX-1004", date: "2026-05-12", accountCode: "2010", accountName: "Accounts Payable", type: "CREDIT", amount: 45000, currency: "USD", description: "AWS Monthly Infrastructure Invoice", postedBy: "AP-Bot-02" },
  { id: "TX-1005", date: "2026-05-15", accountCode: "5010", accountName: "Salaries Expense", type: "DEBIT", amount: 89000, currency: "USD", description: "HR Payroll Cycle May-1", postedBy: "Payroll-Runner" },
  { id: "TX-1006", date: "2026-05-15", accountCode: "1010", accountName: "Cash & Equivalents", type: "CREDIT", amount: 89000, currency: "USD", description: "Staff Salary Disbursement Batch May-1", postedBy: "Payroll-Runner" },
  { id: "TX-1007", date: "2026-05-18", accountCode: "1200", accountName: "Office Supplies", type: "DEBIT", amount: 1500, currency: "USD", description: "Hardware development kit purchases", postedBy: "SCM-Portal" },
  { id: "TX-1008", date: "2026-05-18", accountCode: "1010", accountName: "Cash & Equivalents", type: "CREDIT", amount: 1500, currency: "USD", description: "Hardware Devkits - Visa disbursement", postedBy: "SCM-Portal" }
];

let ledgerDatabase: LedgerEntry[] = [...initialLedger];

// AP / AR Invoices OCR (F-03)
interface Invoice {
  id: string;
  vendor: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  ocrConfidence: number;
  status: "PENDING_MATCH" | "APPROVED" | "PAID" | "FLAGGED";
  lineItems: Array<{ desc: string; qty: number; unitPrice: number }>;
  poMatchedId?: string;
  agingCategory: "0-30 days" | "31-60 days" | "61-90 days" | "90+ days";
}

let invoiceDatabase: Invoice[] = [
  {
    id: "INV-2026-302",
    vendor: "Core Silicon Inc",
    issueDate: "2026-05-01",
    dueDate: "2026-05-31",
    amount: 120000,
    currency: "USD",
    ocrConfidence: 0.98,
    status: "PENDING_MATCH",
    lineItems: [
      { desc: "AI-Forecasting FPGA Processing Units", qty: 200, unitPrice: 500 },
      { desc: "High-Bandwidth Interconnect Controllers", qty: 400, unitPrice: 50 }
    ],
    poMatchedId: "PO-SCM-4409",
    agingCategory: "0-30 days"
  },
  {
    id: "INV-2026-303",
    vendor: "Superdome Fiber Networks",
    issueDate: "2026-04-10",
    dueDate: "2026-05-10",
    amount: 32000,
    currency: "USD",
    ocrConfidence: 0.96,
    status: "APPROVED",
    lineItems: [
      { desc: "Optical Line Terminal Nodes", qty: 8, unitPrice: 4000 }
    ],
    poMatchedId: "PO-SCM-4311",
    agingCategory: "31-60 days"
  },
  {
    id: "INV-2026-304",
    vendor: "Equinix Co-location Ltd",
    issueDate: "2026-05-12",
    dueDate: "2026-06-12",
    amount: 8500,
    currency: "USD",
    ocrConfidence: 0.99,
    status: "PAID",
    lineItems: [
      { desc: "Cabinet Space Monthly Lease Hub-4", qty: 2, unitPrice: 4250 }
    ],
    poMatchedId: "PO-SCM-4512",
    agingCategory: "0-30 days"
  },
  {
    id: "INV-2026-299",
    vendor: "GigaBandwidth Transit LLC",
    issueDate: "2026-01-15",
    dueDate: "2026-02-15",
    amount: 14500,
    currency: "USD",
    ocrConfidence: 0.88,
    status: "FLAGGED",
    lineItems: [
      { desc: "Symmetrical Backhaul Bandwidth (Unmetered)", qty: 1, unitPrice: 14500 }
    ],
    agingCategory: "90+ days"
  }
];

// HR & Employees (F-04)
interface Employee {
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

let employeeDatabase: Employee[] = [
  { id: "EMP-0401", name: "Sarah Jenkins", role: "VP Engineering", department: "Engineering", status: "ACTIVE", email: "sjenkins@amdox.com", baseSalary: 14500, accruedLeaves: 25, leavesTaken: 4, recentPayrollPaid: true },
  { id: "EMP-0402", name: "David Chen", role: "Chief Financial Accountant", department: "Finance", status: "ACTIVE", email: "dchen@amdox.com", baseSalary: 12000, accruedLeaves: 18, leavesTaken: 2, recentPayrollPaid: true },
  { id: "EMP-0403", name: "Elena Rostova", role: "Head of Talent Management", department: "HR", status: "ACTIVE", email: "erostova@amdox.com", baseSalary: 9500, accruedLeaves: 22, leavesTaken: 5, recentPayrollPaid: true },
  { id: "EMP-0404", name: "Marcus Aurelius", role: "Supply Chain & Logistics Lead", department: "Operations", status: "ACTIVE", email: "maurelius@amdox.com", baseSalary: 11000, accruedLeaves: 20, leavesTaken: 1, recentPayrollPaid: false },
  { id: "EMP-0405", name: "Keanu Reeves", role: "Senior Architect - AI Models", department: "Engineering", status: "ON_LEAVE", email: "kreeves@amdox.com", baseSalary: 16000, accruedLeaves: 30, leavesTaken: 12, recentPayrollPaid: false }
];

// Supply Chain & Inventory (F-05, F-06)
interface SKU {
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

let skuDatabase: SKU[] = [
  { id: "SKU-H100", name: "AmGPU Tensor Chip V4", category: "Chips", currentStock: 420, reorderPoint: 500, unitCost: 450, supplier: "Core Silicon Inc", historicalDemand30d: [250, 260, 245, 280, 295], forecastDemand30d: [310, 330, 350, 360, 380] },
  { id: "SKU-FIBR", name: "Amdox MultiMode Fiber G6", category: "Fiber Nodes", currentStock: 1200, reorderPoint: 400, unitCost: 15, supplier: "Superdome Fiber Networks", historicalDemand30d: [800, 750, 690, 810, 850], forecastDemand30d: [880, 920, 950, 930, 940] },
  { id: "SKU-CONT", name: "HPT X-Controller Module", category: "Controllers", currentStock: 85, reorderPoint: 100, unitCost: 350, supplier: "Equinix Co-location Ltd", historicalDemand30d: [90, 95, 110, 105, 98], forecastDemand30d: [115, 120, 122, 130, 135] },
  { id: "SKU-UNIT", name: "Standard AI Server Blade Bay", category: "System Bays", currentStock: 22, reorderPoint: 30, unitCost: 2800, supplier: "GigaBandwidth Transit LLC", historicalDemand30d: [15, 18, 22, 19, 25], forecastDemand30d: [28, 30, 32, 34, 38] }
];

// Project Tracking (F-07)
interface Project {
  id: string;
  name: string;
  lead: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "OVERRUN_ALERT";
  budget: number;
  actualSpent: number;
  tasks: Array<{ id: string; name: string; status: "DONE" | "TODO"; start: string; end: string; progress: number; dept: string }>;
}

let projectDatabase: Project[] = [
  {
    id: "PRJ-9041",
    name: "AI Demand Prophet Suite Deployment",
    lead: "Sarah Jenkins",
    status: "IN_PROGRESS",
    budget: 450000,
    actualSpent: 380000,
    tasks: [
      { id: "TSK-01", name: "Data Ingestion Pipeline", status: "DONE", start: "2026-05-01", end: "2026-05-10", progress: 100, dept: "Engineering" },
      { id: "TSK-02", name: "LSTM SKU Forecast Tuning", status: "DONE", start: "2026-05-11", end: "2026-05-20", progress: 100, dept: "Engineering" },
      { id: "TSK-03", name: "ERP Ledger Auto-Reconciler", status: "TODO", start: "2026-05-21", end: "2026-06-15", progress: 20, dept: "Finance" }
    ]
  },
  {
    id: "PRJ-9042",
    name: "Shenzhen Server Warehouse Expansion",
    lead: "Marcus Aurelius",
    status: "OVERRUN_ALERT",
    budget: 150000,
    actualSpent: 175000,
    tasks: [
      { id: "TSK-04", name: "Racking & Facility Safety Seals", status: "DONE", start: "2026-04-15", end: "2026-05-02", progress: 100, dept: "Operations" },
      { id: "TSK-05", name: "Automated AGV Drone Calibration", status: "TODO", start: "2026-05-03", end: "2026-05-25", progress: 85, dept: "Operations" }
    ]
  },
  {
    id: "PRJ-9043",
    name: "Unified Multi-Tenant SSO",
    lead: "Elena Rostova",
    status: "PLANNING",
    budget: 90000,
    actualSpent: 5000,
    tasks: [
      { id: "TSK-06", name: "Keycloak OIDC Security Handshake", status: "TODO", start: "2026-05-18", end: "2026-06-30", progress: 5, dept: "HR" }
    ]
  }
];

// Audit logs with Cryptographic Hash Chaining (F-09)
interface AuditLog {
  sequence: number;
  timestamp: string;
  eventType: string;
  module: string;
  actor: string;
  description: string;
  txHash: string;
  prevHash: string;
}

let auditLogDatabase: AuditLog[] = [
  {
    sequence: 1,
    timestamp: "2026-05-10T11:20:00Z",
    eventType: "LEDGER_GENERATE",
    module: "GL FINANCE",
    actor: "System Genesis",
    description: "Seed transaction entry posted for Subscription Revenue of $250,000",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
    txHash: "a9fd638e8cb2fdf538e1b65b6d91cd3ea5c14529f7cb2f9b2f293cf75fca9b1c"
  }
];

// Helper to push log and lock hash chain
function createChainLog(module: string, eventType: string, actor: string, desc: string) {
  const lastLog = auditLogDatabase[auditLogDatabase.length - 1];
  const prevHash = lastLog ? lastLog.txHash : "0000000000000000000000000000000000000000000000000000000000000000";
  const sequence = (lastLog ? lastLog.sequence : 0) + 1;
  const timestamp = new Date().toISOString();

  // Create hash chaining
  const contents = `${sequence}:${timestamp}:${eventType}:${module}:${actor}:${desc}:${prevHash}`;
  const txHash = createHash("sha256").update(contents).digest("hex");

  auditLogDatabase.push({
    sequence,
    timestamp,
    eventType,
    module,
    actor,
    description: desc,
    prevHash,
    txHash
  });
}

// Generate the initial sequence
createChainLog("GL FINANCE", "LEDGER_ENTRY", "AP-Bot-02", "Posted Monthly AWS Infrastructure Invoice with amount $45,000");
createChainLog("HR PAYROLL", "PAYROLL_RUN", "ELENA_ROSTOVA", "Accrued monthly vacation leaves and cleared base tax models for staff");

// ==========================================
// 2. EXPRESS MIDDLEWARE AND ROUTES SETUP
// ==========================================

async function startServer() {
  const app = express();
  app.use(express.json());

  // Log accesses
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[API Req] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API ENDPOINTS ---

  // Double entry Ledger
  app.get("/api/ledger", (req, res) => {
    res.json(ledgerDatabase);
  });

  app.post("/api/ledger", (req, res) => {
    const { accountCode, accountName, type, amount, currency, description, postedBy } = req.body;
    if (!accountCode || !accountName || !type || !amount) {
       res.status(400).json({ error: "Missing required fields" });
       return;
    }
    const newEntry: LedgerEntry = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      accountCode,
      accountName,
      type: type === "CREDIT" ? "CREDIT" : "DEBIT",
      amount: Number(amount),
      currency: currency || "USD",
      description,
      postedBy: postedBy || "Web Terminal"
    };
    ledgerDatabase.unshift(newEntry);
    createChainLog("GL FINANCE", "LEDGER_ENTRY_MANUAL", "Web UI User", `Created Manual Double-Entry for ${accountName} - Type: ${type} - Amount: $${amount}`);
    res.json(newEntry);
  });

  // Invoices AP/AR
  app.get("/api/invoices", (req, res) => {
    res.json(invoiceDatabase);
  });

  app.post("/api/invoices", (req, res) => {
    // Simulated upload
    const { vendor, amount, lineItems } = req.body;
    const newInv: Invoice = {
      id: `INV-2026-${Math.floor(400 + Math.random() * 599)}`,
      vendor: vendor || "Unknown Vendor Corp",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: Number(amount) || 12500,
      currency: "USD",
      ocrConfidence: +(0.85 + Math.random() * 0.14).toFixed(2),
      status: "PENDING_MATCH",
      lineItems: lineItems || [{ desc: "Unspecified Inventory Line Item", qty: 1, unitPrice: amount || 12500 }],
      agingCategory: "0-30 days"
    };
    invoiceDatabase.unshift(newInv);
    createChainLog("AP AUTOMATION", "INVOICE_OCR_INGEST", "AI-OCR-Engine", `Auto-ingested raw invoice ${newInv.id} from ${newInv.vendor} with OCR confidence ${newInv.ocrConfidence}`);
    res.json(newInv);
  });

  app.post("/api/invoices/:id/approve", (req, res) => {
    const { id } = req.params;
    const item = invoiceDatabase.find((inv) => inv.id === id);
    if (!item) {
       res.status(404).json({ error: "Invoice not found" });
       return;
    }
    item.status = "APPROVED";
    createChainLog("AP AUTOMATION", "INVOICE_APPROVE", "Manager-User", `Approved AP/AR match transaction for invoice ID ${id}`);
    res.json(item);
  });

  // HR & Payroll
  app.get("/api/employees", (req, res) => {
    res.json(employeeDatabase);
  });

  app.post("/api/employees/run-payroll", (req, res) => {
    // Clear all unpaid and disburse ledger cost
    employeeDatabase.forEach((emp) => {
      if (!emp.recentPayrollPaid && emp.status === "ACTIVE") {
        emp.recentPayrollPaid = true;
        // Post expense to ledger
        ledgerDatabase.unshift({
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          accountCode: "5010",
          accountName: "Salaries Expense",
          type: "DEBIT",
          amount: emp.baseSalary,
          currency: "USD",
          description: `Consolidated Gross-to-Net disbursement for ${emp.name}`,
          postedBy: "Intelli-Payroll-Engine"
        });
        ledgerDatabase.unshift({
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          accountCode: "1010",
          accountName: "Cash & Equivalents",
          type: "CREDIT",
          amount: emp.baseSalary,
          currency: "USD",
          description: `Payroll Disbursement transfer ${emp.id}`,
          postedBy: "Intelli-Payroll-Engine"
        });
      }
    });
    createChainLog("HR PAYROLL", "RUN_PAYROLL_CYCLE", "Core Payroll Daemon", "Disbursed standard payroll cycle for active, unpaid staff.");
    res.json({ success: true, message: "Cleared current batch payroll and automatically logged double-entry journals." });
  });

  app.post("/api/employees/submit-leave", (req, res) => {
    const { employeeId, leaveDays } = req.body;
    const emp = employeeDatabase.find(e => e.id === employeeId);
    if (!emp) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    const days = Number(leaveDays) || 1;
    emp.accruedLeaves = Math.max(0, emp.accruedLeaves - days);
    emp.leavesTaken += days;
    emp.status = "ON_LEAVE";
    createChainLog("HR PAYROLL", "LEAVE_SUBMIT", "HR-Staff", `Granted ${days} days leave request to ${emp.name}`);
    res.json(emp);
  });

  // Inventory & Stock levels
  app.get("/api/inventory", (req, res) => {
    res.json(skuDatabase);
  });

  app.post("/api/inventory/reorder", (req, res) => {
    const { skuId, amount } = req.body;
    const sku = skuDatabase.find(s => s.id === skuId);
    if (!sku) {
      res.status(404).json({ error: "SKU not found" });
       return;
    }
    const orderQty = Math.max(10, Number(amount) || 100);
    sku.currentStock += orderQty;
    // Log purchase order double-entry payment automatically
    const poCost = orderQty * sku.unitCost;
    ledgerDatabase.unshift({
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      accountCode: "5020",
      accountName: "SKU Inventory Purchases",
      type: "DEBIT",
      amount: poCost,
      currency: "USD",
      description: `Replenished stock of ${sku.name} (+${orderQty} units)`,
      postedBy: "SCM-Stock-Daemon"
    });
    ledgerDatabase.unshift({
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      accountCode: "1010",
      accountName: "Cash & Equivalents",
      type: "CREDIT",
      amount: poCost,
      currency: "USD",
      description: `Settlement payout for PO stock purchase SKU id: ${sku.id}`,
      postedBy: "SCM-Stock-Daemon"
    });

    createChainLog("SUPPLY CHAIN", "STOCK_REPLENISH", "Supply-Daemon", `Restocked ${sku.name} by ${orderQty} units. Logged general ledger debit matching of $${poCost}`);
    res.json(sku);
  });

  // Projects
  app.get("/api/projects", (req, res) => {
    res.json(projectDatabase);
  });

  app.post("/api/projects/add-task", (req, res) => {
    const { projectId, taskName, dept, durationDays } = req.body;
    const proj = projectDatabase.find(p => p.id === projectId);
    if (!proj) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const days = Number(durationDays) || 7;
    const newTask = {
      id: `TSK-${Math.floor(10 + Math.random()*89)}`,
      name: taskName || "Configure Microserver API Gateway",
      status: "TODO" as const,
      start: new Date().toISOString().split("T")[0],
      end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 0,
      dept: dept || "Engineering"
    };
    proj.tasks.push(newTask);
    createChainLog("PROJECT MANAGEMENT", "GANTT_TASK_APPEND", "Proj-Manager", `Appended task ${newTask.name} for project ${proj.name}`);
    res.json(proj);
  });

  // Compliance Audit Logs
  app.get("/api/audit-logs", (req, res) => {
    res.json(auditLogDatabase);
  });

  // Verify Audit Trail Integrity (Proving immutable security SOC 2)
  app.post("/api/audit-logs/verify", (req, res) => {
    let isValid = true;
    const failures: Array<{ seq: number; expected: string; actual: string }> = [];

    for (let i = 0; i < auditLogDatabase.length; i++) {
      const current = auditLogDatabase[i];
      const prevHash = i === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : auditLogDatabase[i - 1].txHash;

      // Calculate what it should be
      const contents = `${current.sequence}:${current.timestamp}:${current.eventType}:${current.module}:${current.actor}:${current.description}:${prevHash}`;
      const expectedHash = createHash("sha256").update(contents).digest("hex");

      if (current.prevHash !== prevHash || current.txHash !== expectedHash) {
        isValid = false;
        failures.push({
          seq: current.sequence,
          expected: expectedHash,
          actual: current.txHash
        });
      }
    }

    res.json({
      isValid,
      totalSequenceChecked: auditLogDatabase.length,
      timestamp: new Date().toISOString(),
      governingAuthority: "SOC 2 Type II Compliance Verifier",
      failures
    });
  });

  // --- GEMINI AI INTEGRATION (COPILOT) ---
  app.post("/api/ai/copilot", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ reply: "I need a message or forecast prompt to provide insights." });
      return;
    }

    // Lazy initialization of the Gemini SDK client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Graceful fallback simulation when API key is missing, presenting intelligent enterprise insights
      const lower = prompt.toLowerCase();
      let customSimText = `[Simulated ERP Expert Insights - Set your Gemini API Key in 'Secrets' for active live analysis] \n\nHello from Amdox Intelligent Assistant! Based on local database calculations: \n`;
      if (lower.includes("forecast") || lower.includes("demand")) {
        customSimText += `- **AI Demand Forecasting**: SKU 'SKU-H100' (AmGPU Tensor Chip) exhibits a rising demand curve over the next 30 days (+12% projected due to tech workloads). SCM suggests keeping safety buffers around 450 units to avoid stocking limits.\n- **Replenishment alerts**: 3 core items (SKU-H100, SKU-CONT, SKU-UNIT) are currently below or near their reorder thresholds. Restock action is highly recommended.`;
      } else if (lower.includes("ledger") || lower.includes("finance") || lower.includes("budget")) {
        customSimText += `- **Financial Status**: Total active Ledger Assets are calculated at $250,000 against payables and salary expenditures.\n- **Budget Overruns**: Project *Shenzhen Server Warehouse Expansion* is currently 16.7% over budget ($175k spent vs $150k budgeted). Let's review the drone calibration overheads to prevent scale leakage.`;
      } else if (lower.includes("payroll") || lower.includes("hr") || lower.includes("employee")) {
        customSimText += `- **Staff Overview**: Out of 5 cataloged employees, 4 are ACTIVE and 1 is ON_LEAVE (Keanu Reeves). Payroll is fully paid for Engineering and HR, while SCM logistics staff payroll is pending clearing.`;
      } else {
        customSimText += `- **System Analytics**: Verified a valid chain hash sequence of ${auditLogDatabase.length} records under SOC 2 requirements with 0 cryptographic anomalies.\n- I can analyze inventory shortages, auto-matching OCR logs, project Gantt milestones, and ledger accounts. Please ask any specific operational questions!`;
      }
      res.json({ reply: customSimText, simulated: true });
      return;
    }

    try {
      // Compliant initialization
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Assemble live Ground-Truth data context so Gemini knows everything happening in the ERP
      const erpDataContext = {
        ledger: ledgerDatabase.slice(0, 15),
        invoices: invoiceDatabase,
        employees: employeeDatabase,
        inventory: skuDatabase,
        projects: projectDatabase,
        auditLogsCount: auditLogDatabase.length,
        systemHealth: {
          slaGoal: "99.9%",
          p95LatencyGoal: "<300ms",
          dbStatus: "HEALTHY",
          environment: "Cloud Run Container",
          localTime: new Date().toISOString()
        }
      };

      const systemInstruction = `You are the core Enterprise Brain AI Copilot for AMDOX TECHNOLOGIES. 
You are embedded directly inside the "Enterprise AI-Powered Cloud ERP Suite".
You have real-time ground-truth programmatic access to the ERP Database, which is provided to you in JSON in this prompt.

Core Tasks:
1. Provide accurate, professional financial, supply chain, and workforce insights.
2. Flag budget variances (e.g., if project costs exceed planned budgets).
3. Identify SCM items that have dropped below their 'reorderPoint' threshold.
4. Answer ledger and accounting integrity questions.
5. Offer concrete forecasting optimization suggestions matching "LSTM & Prophet" parameters.
6. Address users with confidence and executive prose. Keep formatting highly scannable using standard markdown. Do not invent details beyond the active database. Current timing context: May 2026.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `DATABASE CONTEXT:
${JSON.stringify(erpDataContext, null, 2)}

USER QUESTION:
${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      res.json({ reply: response.text || "No response received.", simulated: false });

    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: "Gemini server processing error.", message: err.message });
    }
  });


  // --- VITE DEV OR PRODUCTION STATIC SERVER ---

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development (Vite integrated) mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // PORT bindings
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Amdox Technologies ERP Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
