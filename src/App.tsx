import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Receipt,
  BrainCircuit,
  Users,
  Package,
  ShieldCheck,
  CalendarDays,
  Radio,
  Cpu,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  FilePlus,
  Lock,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Wifi,
  WifiOff,
  UserCheck,
  TrendingUp,
  Coins,
  History,
  Terminal,
  Clock,
  Layers,
  Sparkle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Settings,
  Search,
  User,
  Mail,
  LogOut
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { LedgerEntry, Invoice, Employee, SKU, Project, AuditLog, CopilotResponse, AuditVerificationResult } from "./types";

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Floating Chatbot Copilot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Multi-tenant selection (F-01)
  const [currentTenant, setCurrentTenant] = useState<string>("Amdox_Prod_US_East");
  const [showTenantSelector, setShowTenantSelector] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark" | string>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  // User Authentication states
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(() => {
    const saved = localStorage.getItem("current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authRoleSelection, setAuthRoleSelection] = useState<string>("SuperAdmin");
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  useEffect(() => {
    const savedUsers = localStorage.getItem("registered_users");
    if (!savedUsers) {
      const initialUsers = [
        { email: "admin@amdox.io", password: "password123", name: "Alex Rivera", role: "SuperAdmin" },
        { email: "auditor@amdox.io", password: "password123", name: "Sarah Connor", role: "ExternalAuditor" }
      ];
      localStorage.setItem("registered_users", JSON.stringify(initialUsers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [userRole, setUserRole] = useState<string>("SuperAdmin");
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [highValueThreshold, setHighValueThreshold] = useState<string>("50000");
  const [securityPolicy, setSecurityPolicy] = useState<string>("Strict-SOC2");

  // Header Search Autocomplete State & Configuration
  const [searchVal, setSearchVal] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const ERP_SUGGESTIONS = [
    { id: "s1", phrase: "invoices", category: "MODULE", description: "OIDC Scan Room & Invoice recognition", targetTab: "ocr" },
    { id: "s2", phrase: "employees", category: "MODULE", description: "Resource profiles, payroll & staff directory", targetTab: "hr" },
    { id: "s3", phrase: "projects", category: "MODULE", description: "Smart Projects, Gantt charts & taskboards", targetTab: "projects" },
    { id: "s4", phrase: "ledger", category: "MODULE", description: "Financial Ledger balance sheets & journal entries", targetTab: "ledger" },
    { id: "s5", phrase: "inventory", category: "MODULE", description: "Supply Chain product storage & routing", targetTab: "scm" },
    { id: "s6", phrase: "upload invoice", category: "ACTION", description: "Extract scanned PDF parameters", targetTab: "ocr" },
    { id: "s7", phrase: "add ledger entry", category: "ACTION", description: "Post manual credit/debit records", targetTab: "ledger" },
    { id: "s8", phrase: "api keys", category: "MODULE", description: "Configure API gateways & webhook endpoints", targetTab: "api" },
    { id: "s9", phrase: "compliance audit", category: "MODULE", description: "Scan system event logs & SOC2 trace audits", targetTab: "audit" },
    { id: "s10", phrase: "dashboard", category: "MODULE", description: "Analytics modules overview & charts", targetTab: "dashboard" },
    { id: "s11", phrase: "user settings", category: "ACTION", description: "Manage active security policy & administrative role", targetTab: "settings" }
  ];

  const filteredSuggestions = searchVal.trim() === ""
    ? ERP_SUGGESTIONS.filter(item => ["invoices", "employees", "projects", "ledger"].includes(item.phrase))
    : ERP_SUGGESTIONS.filter(item => 
        item.phrase.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.category.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.description.toLowerCase().includes(searchVal.toLowerCase())
      );

  // Focus search with Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Soft click outside matching
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: typeof ERP_SUGGESTIONS[0]) => {
    setActiveTab(suggestion.targetTab);
    setSearchVal("");
    setIsSearchFocused(false);
    setActiveSuggestionIndex(-1);
    addNotification(`Secure Gateway routing: Switched to ${suggestion.phrase.toUpperCase()} module`, "success");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
        handleSelectSuggestion(filteredSuggestions[activeSuggestionIndex]);
      } else if (filteredSuggestions.length > 0) {
        handleSelectSuggestion(filteredSuggestions[0]);
      } else {
        addNotification(`Query scope complete: No exact module matching "${searchVal}"`, "warn");
      }
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  // Database States fetched from Express backend
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<SKU[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Local interaction forms states
  const [newJournal, setNewJournal] = useState({
    accountCode: "1010",
    accountName: "Cash & Equivalents",
    type: "DEBIT",
    amount: "",
    description: ""
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    vendor: "HighTech Optical Giga",
    amount: "45000",
    lineItemDesc: "Transponder Optical Switch Hubs"
  });

  const [newGanttTask, setNewGanttTask] = useState({
    projectId: "PRJ-9041",
    taskName: "",
    dept: "Engineering",
    durationDays: "14"
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeId: "EMP-0401",
    days: "3"
  });

  // Verification results
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Connection and synchronization mock (F-12)
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineCacheCount, setOfflineCacheCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Notification Toast simulation (F-10)
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: "success" | "warn" | "info" }>>([
    { id: 1, message: "Multi-Tenant isolation parameters verified.", type: "success" },
    { id: 2, message: "SKU 'AmGPU Tensor Chip V4' is currently below safety levels.", type: "warn" }
  ]);

  // AI Copilot terminal (Gemini) states (F-06, F-08)
  const [copilotQuery, setCopilotQuery] = useState<string>("");
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: "user" | "ai"; text: string; simulated?: boolean }>>([
    {
      sender: "ai",
      text: "System initialized. I am your AMDOX Intelligent ERP Copilot. I analyze Ledger balances, supply-chain stocks, project budget variances, and compliance rules directly from the system database. Ask me any question!",
      simulated: false
    }
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  // References
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Drag and drop simulator for invoice OCR (F-03)
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [ocrScanning, setOcrScanning] = useState<boolean>(false);

  // Fetch initial database items from backend
  const refreshDatabase = async () => {
    try {
      const pLedger = fetch("/api/ledger").then((res) => res.json());
      const pInvoices = fetch("/api/invoices").then((res) => res.json());
      const pEmployees = fetch("/api/employees").then((res) => res.json());
      const pInventory = fetch("/api/inventory").then((res) => res.json());
      const pProjects = fetch("/api/projects").then((res) => res.json());
      const pAudit = fetch("/api/audit-logs").then((res) => res.json());

      const [ledgerData, invoiceData, employeeData, inventoryData, projectData, auditData] = await Promise.all([
        pLedger,
        pInvoices,
        pEmployees,
        pInventory,
        pProjects,
        pAudit
      ]);

      setLedger(ledgerData);
      setInvoices(invoiceData);
      setEmployees(employeeData);
      setInventory(inventoryData);
      setProjects(projectData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error("Critical: Failed to communicate database with Express server:", err);
    }
  };

  useEffect(() => {
    refreshDatabase();
  }, []);

  useEffect(() => {
    // Scroll copilot assistant terminal to the bottom
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotHistory]);

  const addNotification = (message: string, type: "success" | "warn" | "info" = "info") => {
    const id = Date.now();
    setNotifications((prev) => [{ id, message, type }, ...prev].slice(0, 5));
  };

  // Helper calculation metrics
  const totalAssets = ledger
    .filter((l) => l.accountCode.startsWith("1")) // Asset codes start with 1 e.g. Cash 1010
    .reduce((sum, current) => {
      // In typical ledger: DEBIT increases assets, CREDIT decreases assets
      return current.type === "DEBIT" ? sum + current.amount : sum - current.amount;
    }, 0);

  const totalExpense = ledger
    .filter((l) => l.accountCode.startsWith("5")) // Expense codes start with 5 e.g. 5010 Salaries
    .reduce((sum, curr) => sum + curr.amount, 0);

  const lowStockSkus = inventory.filter((s) => s.currentStock <= s.reorderPoint);

  // Trigger Offline sync simulation (F-12)
  const triggerSync = () => {
    if (offlineCacheCount === 0) return;
    setSyncing(true);
    addNotification("Accessing service worker network reconnect daemon...", "info");
    setTimeout(() => {
      setSyncing(false);
      setOfflineCacheCount(0);
      refreshDatabase();
      addNotification("Synchronized all offline cached queue operations back to centralized PostgreSQL database.", "success");
    }, 1500);
  };

  // POST double-entry journal entry manually (F-02)
  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournal.amount || isNaN(Number(newJournal.amount))) {
      addNotification("Invalid debit/credit numeric amount.", "warn");
      return;
    }

    if (!isOnline) {
      // Offline support caching (F-12)
      setOfflineCacheCount((prev) => prev + 1);
      addNotification("Offline mode simulated. Mutation queued locally in ServiceWorker cache.", "info");
      return;
    }

    try {
      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJournal)
      });
      if (response.ok) {
        addNotification(`Journal entries updated. Posted to account code ${newJournal.accountCode}.`, "success");
        setNewJournal({ accountCode: "1010", accountName: "Cash & Equivalents", type: "DEBIT", amount: "", description: "" });
        refreshDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit invoice simulation (F-03 OCR)
  const handleSubmitInvoiceOCR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceForm.amount || isNaN(Number(newInvoiceForm.amount))) {
      addNotification("Invalid invoice amount.", "warn");
      return;
    }
    await processSimulatedOCR(newInvoiceForm.vendor, Number(newInvoiceForm.amount), newInvoiceForm.lineItemDesc);
  };

  const processSimulatedOCR = async (vendor: string, amount: number, lineItemDesc: string) => {
    setOcrScanning(true);
    addNotification(`AI Neural Invoice OCR processing raw paper stream...`, "info");

    setTimeout(async () => {
      try {
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendor,
            amount,
            lineItems: [{ desc: lineItemDesc, qty: 1, unitPrice: amount }]
          })
        });
        if (response.ok) {
          addNotification("OCR extraction matched. Line entries matched with purchase codes.", "success");
          setOcrScanning(false);
          setNewInvoiceForm({ vendor: "HighTech Optical Giga", amount: "45000", lineItemDesc: "Transponder Optical Switch Hubs" });
          refreshDatabase();
        }
      } catch (err) {
        console.error(err);
        setOcrScanning(false);
      }
    }, 1800);
  };

  const handleApproveInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/approve`, { method: "POST" });
      if (response.ok) {
        addNotification(`Invoice ${invoiceId} approved and allocated to cash reserves.`, "success");
        refreshDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HR Payroll process batch (F-04)
  const handleRunPayrollCycle = async () => {
    const unpaidEmp = employees.filter((e) => !e.recentPayrollPaid && e.status === "ACTIVE");
    if (unpaidEmp.length === 0) {
      addNotification("All active workforce salaries are currently up-to-date for May 2026.", "info");
      return;
    }
    try {
      const response = await fetch("/api/employees/run-payroll", { method: "POST" });
      if (response.ok) {
        addNotification("Disbursed current cycle. Deducted corresponding accounts in General Ledger.", "success");
        refreshDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/employees/submit-leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: leaveForm.employeeId,
          leaveDays: Number(leaveForm.days) || 1
        })
      });
      if (response.ok) {
        addNotification("Leave request registered. Syncing accrual balance.", "success");
        refreshDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SKU Restocking Trigger (F-05)
  const handleRestockSku = async (skuId: string, minOrderAmt: number) => {
    try {
      const response = await fetch("/api/inventory/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skuId, amount: minOrderAmt })
      });
      if (response.ok) {
        addNotification(`Replenishment Purchase Order issued for stock SKU ID: ${skuId}`, "success");
        refreshDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gantt task appender (F-07)
  const handleAddGanttTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGanttTask.taskName) {
      addNotification("Please specify a task name for project roadmaps.", "warn");
      return;
    }
    try {
      const response = await fetch("/api/projects/add-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGanttTask)
      });
      if (response.ok) {
        addNotification("Appended item to milestones roadmap timeline.", "success");
        setNewGanttTask((prev) => ({ ...prev, taskName: "" }));
        refreshDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Login submission (Local verification backend)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      addNotification("Please provide both email and security credentials.", "warn");
      return;
    }
    const savedUsersStr = localStorage.getItem("registered_users") || "[]";
    const savedUsers = JSON.parse(savedUsersStr);
    const matched = savedUsers.find(
      (u: any) => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword
    );
    if (matched) {
      const userObj = { name: matched.name, email: matched.email, role: matched.role };
      setCurrentUser(userObj);
      setUserRole(matched.role);
      localStorage.setItem("current_user", JSON.stringify(userObj));
      addNotification(`Welcome back, ${matched.name}. Security clearance active.`, "success");
      setAuthPassword("");
    } else {
      addNotification("Access Denied: Invalid cryptographic security credentials.", "warn");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      addNotification("All registration field values are high-security required variables.", "warn");
      return;
    }
    if (authPassword.length < 6) {
      addNotification("Cryptographic security key must be at least 6 characters long.", "warn");
      return;
    }
    const savedUsersStr = localStorage.getItem("registered_users") || "[]";
    const savedUsers = JSON.parse(savedUsersStr);
    const alreadyExists = savedUsers.some(
      (u: any) => u.email.toLowerCase() === authEmail.toLowerCase()
    );
    if (alreadyExists) {
      addNotification("An account already exists under this security OIDC registry email.", "warn");
      return;
    }

    const newUser = {
      email: authEmail,
      password: authPassword,
      name: authName,
      role: authRoleSelection
    };
    savedUsers.push(newUser);
    localStorage.setItem("registered_users", JSON.stringify(savedUsers));

    // Auto-login registered system profile
    const userObj = { name: newUser.name, email: newUser.email, role: newUser.role };
    setCurrentUser(userObj);
    setUserRole(newUser.role);
    localStorage.setItem("current_user", JSON.stringify(userObj));
    addNotification(`Security registry complete. Welcome to AMDOX, ${newUser.name}!`, "success");
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("current_user");
    setShowProfileDropdown(false);
    addNotification("OIDC secure shell session terminated.", "info");
  };

  // SOC 2 Integrity check (F-09)
  const handleVerifyComplianceChain = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    addNotification("Contacting cryptographic audit verifier...", "info");
    setTimeout(async () => {
      try {
        const response = await fetch("/api/audit-logs/verify", { method: "POST" });
        if (response.ok) {
          const data = await response.json();
          setVerificationResult(data);
          if (data.isValid) {
            addNotification("Zero cryptographic ledger anomalies found. Chains match perfectly.", "success");
          } else {
            addNotification("Compliance warning: Audit mismatch detected!", "warn");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsVerifying(false);
      }
    }, 1200);
  };

  // Gemini AI intelligent assistant handler (F-06, F-08 AI)
  const handleAskCopilot = async (overrideQuery?: string) => {
    const targetQuery = overrideQuery || copilotQuery;
    if (!targetQuery.trim()) return;

    // Add user question to history
    setCopilotHistory((prev) => [...prev, { sender: "user", text: targetQuery }]);
    setCopilotQuery("");
    setIsCopilotLoading(true);

    try {
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetQuery })
      });
      if (response.ok) {
        const data: CopilotResponse = await response.json();
        setCopilotHistory((prev) => [
          ...prev,
          { sender: "ai", text: data.reply, simulated: data.simulated }
        ]);
      } else {
        setCopilotHistory((prev) => [
          ...prev,
          { sender: "ai", text: "Communication timeout. Please verify you have your server and networks set properly." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setCopilotHistory((prev) => [
        ...prev,
        { sender: "ai", text: "General connection failure in the Express endpoint server." }
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    addNotification("Raw PDF format extracted successfully. Re-routing through custom OCR matching models...", "info");
    processSimulatedOCR("Core Silicon Inc", 120000, "Injected FPGA Core logic matrices");
  };

  // BI Chart styling palette (Bento theme matching)
  const PIE_COLORS = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#a855f7"];

  if (!currentUser) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center relative overflow-hidden font-sans ${theme === "light" ? "light-theme bg-[#f8fafc]" : "bg-[#0A0A0B]"} transition-colors duration-300`}>
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[355px] h-[355px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Global Floating Notifications inside Login screen too */}
        <div className="fixed top-6 right-6 z-[100] max-w-sm space-y-3 pointer-events-auto">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl border text-xs shadow-2xl flex items-start gap-3 backdrop-blur-md transition-all ${
                n.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-100"
                  : n.type === "warn"
                  ? "bg-amber-950/60 border-amber-500/30 text-amber-100"
                  : "bg-indigo-950/60 border-indigo-500/30 text-indigo-100"
              }`}
            >
              <span className={`font-bold uppercase ${n.type === 'success' ? 'text-emerald-400' : n.type === 'warn' ? 'text-amber-400' : 'text-indigo-400'}`}>
                //
              </span>
              <p className="flex-1 font-sans">{n.message}</p>
            </motion.div>
          ))}
        </div>

        {/* Outer theme switcher just for accessibility on login page */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            onClick={() => {
              const nextTheme = theme === "dark" ? "light" : "dark";
              setTheme(nextTheme);
              addNotification(`Interface theme switched to ${nextTheme.toUpperCase()} mode.`, "success");
            }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition duration-200 cursor-pointer shadow-lg"
            title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>

        <div className="w-full max-w-md p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-500/20 mb-4 animate-bounce" style={{ animationDuration: "3s" }}>
              A
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">AMDOX_OS</h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1.5">Enterprise Cloud Systems v4.0.2</p>
          </div>

          <motion.div 
            layout 
            className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative"
          >
            {/* Form Mode Tabs */}
            <div className="grid grid-cols-2 bg-slate-950/60 p-1 rounded-xl mb-6 border border-slate-900">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthEmail("");
                  setAuthPassword("");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === "login" 
                    ? "bg-indigo-600 text-white shadow" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setAuthEmail("");
                  setAuthPassword("");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === "signup" 
                    ? "bg-indigo-600 text-white shadow" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authMode === "login" ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-400 text-center">
                    Enter your authorized OIDC domain credentials to request operational secure shell mapping.
                  </p>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-500">Security Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        className="w-full p-3 pl-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-sans transition"
                        placeholder="e.g. admin@amdox.io"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-500">Security Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        className="w-full p-3 pl-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono transition"
                        placeholder="••••••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition duration-200 shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:translate-y-0.5 cursor-pointer"
                  >
                    Authenticate Secure Shell
                  </button>

                  {/* Sandbox Demo Credentials Helper */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 text-center">Simulated Sandbox Credentials</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthEmail("admin@amdox.io");
                          setAuthPassword("password123");
                          addNotification("Pasted SuperAdmin credentials.", "info");
                        }}
                        className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-left rounded-xl transition cursor-pointer"
                      >
                        <p className="text-[10px] font-semibold text-slate-300">SuperAdmin Space</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">admin@amdox.io</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthEmail("auditor@amdox.io");
                          setAuthPassword("password123");
                          addNotification("Pasted ExternalAuditor credentials.", "info");
                        }}
                        className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-left rounded-xl transition cursor-pointer"
                      >
                        <p className="text-[10px] font-semibold text-slate-300">Auditor Space</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">auditor@amdox.io</p>
                      </button>
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-400 text-center">
                    Register a new public core identity with custom clearance authorization levels.
                  </p>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-500">FullName</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        className="w-full p-3 pl-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-sans transition"
                        placeholder="e.g. Marcus Aurelius"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-500">Security Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        className="w-full p-3 pl-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-sans transition"
                        placeholder="e.g. marcus@amdox.io"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-500">Clearance Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        className="w-full p-3 pl-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono transition"
                        placeholder="Must be 6+ chars"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-500">System Permission Clearance</label>
                    <select
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs cursor-pointer transition select-none"
                      value={authRoleSelection}
                      onChange={(e) => setAuthRoleSelection(e.target.value)}
                    >
                      <option value="SuperAdmin">SuperAdmin (Full Cryptographic Read-Write Clearances)</option>
                      <option value="ExternalAuditor">ExternalAuditor (Read-Only SOC2 Ledger Inspection)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition duration-200 shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:translate-y-0.5 cursor-pointer"
                  >
                    Build Isolated Tenant Identity
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${theme === "light" ? "light-theme bg-[#f8fafc]" : "bg-[#0A0A0B]"} text-slate-200 flex flex-col font-sans transition-colors duration-300 overflow-hidden`}>
      
      {/* ================= HEADER SECTION ================= */}
      <header className="border-b border-slate-900 bg-[#0A0A0B] sticky top-0 z-50 backdrop-blur-md px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">A</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-display">AMDOX_OS</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-none mt-1">v4.0.2 Stable</p>
          </div>
        </div>

        {/* ================= SEARCH BAR WITH AUTO-SUGGESTIONS ================= */}
        <div ref={searchContainerRef} className="relative w-full md:w-80 lg:w-96">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search ERP modules & terms (⌘K)..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setActiveSuggestionIndex(-1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-12 py-2.5 bg-slate-900 hover:bg-[#0d0d11]/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 rounded-xl transition duration-200 outline-none focus:bg-[#07070a] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30"
            />
            <span className="absolute right-3 px-1.5 py-0.5 border border-slate-800 bg-[#09090C] rounded text-[8px] font-mono font-bold tracking-wider text-slate-500 select-none pointer-events-none uppercase">
              ⌘K
            </span>
          </div>

          {/* Autocomplete suggestions popup */}
          {isSearchFocused && (
            <div className="absolute left-0 mt-2 w-full rounded-2xl bg-slate-950/95 border border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-3.5 z-50 text-left backdrop-blur-xl">
              <div className="flex items-center justify-between text-slate-500 font-bold tracking-widest font-mono text-[9px] border-b border-slate-900 pb-2 mb-2">
                <span>{searchVal.trim() === "" ? "COMMON ERP SYSTEM QUERIES" : "MATCHED SYSTEM ACTIONS"}</span>
                <span className="text-[8px] text-indigo-400 font-mono font-bold uppercase">{filteredSuggestions.length} items</span>
              </div>

              {filteredSuggestions.length > 0 ? (
                <div className="space-y-1 max-h-[220px] overflow-y-auto no-scrollbar">
                  {filteredSuggestions.map((item, index) => {
                    const isKeyboardActive = index === activeSuggestionIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                        className={`w-full text-left p-2 rounded-xl transition duration-150 flex items-start gap-2.5 cursor-pointer ${
                          isKeyboardActive
                            ? "bg-indigo-600/10 border border-indigo-500/30 text-white"
                            : "bg-transparent border border-transparent text-slate-300 hover:bg-slate-800/30 hover:text-white"
                        }`}
                      >
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide font-mono mt-0.5 shrink-0 ${
                          item.category === "ACTION"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}>
                          {item.category}
                        </span>
                        <div className="flex-1 min-w-0 leading-tight">
                          <p className="text-xs font-semibold font-sans truncate">{item.phrase}</p>
                          <p className="text-[10px] truncate mt-0.5 font-sans text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center">
                  <p className="text-xs text-slate-400">No matching system queries found.</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono leading-relaxed">
                    Try entering general tags like <span className="text-indigo-400">"invoices"</span>, <span className="text-indigo-400">"employees"</span>, or <span className="text-indigo-400">"projects"</span>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Controllers & Tenancy Portal */}
        <div className="flex flex-wrap items-center gap-4">
          {offlineCacheCount > 0 && (
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-indigo-650/20 hover:bg-indigo-600 text-white border border-indigo-500/30 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer animate-pulse shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>SYNC NOW ({offlineCacheCount})</span>
            </button>
          )}

          {/* Real-time Ledger Assets Indicator (moved from sidebar) */}
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-xs font-mono">
            <span className="text-slate-500">GL Assets:</span>
            <span className="font-semibold text-emerald-400 font-sans">${totalAssets.toLocaleString()}</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase">USD</span>
          </div>

          {/* Theme Switcher Toggle (Light/Dark Mode) */}
          <button
            onClick={() => {
              const nextTheme = theme === "dark" ? "light" : "dark";
              setTheme(nextTheme);
              addNotification(`Interface theme switched to ${nextTheme.toUpperCase()} mode.`, "success");
            }}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center text-slate-450 hover:text-white transition cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" style={{ animationDuration: "3s" }} />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Notification Center system alerts dropdown (moved from sidebar) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center text-slate-450 hover:text-white transition cursor-pointer relative"
              title="System Alerts & Logs"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#09090C] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 z-50 text-left font-sans">
                <div className="flex items-center justify-between text-slate-450 font-bold tracking-widest font-mono text-[9px] border-b border-slate-850 pb-2 mb-2">
                  <span>SYSTEM ALERTS</span>
                  <span className="text-[9px] uppercase text-indigo-400 font-bold">{notifications.length} Logs</span>
                </div>
                <div className="space-y-2.5 h-[200px] overflow-y-auto no-scrollbar pr-1 font-mono text-[10px]">
                  {notifications.map((n) => (
                    <div key={n.id} className="border-b border-slate-900/40 pb-2 last:border-0 last:pb-0 text-slate-300">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`font-bold ${
                          n.type === "success" ? "text-emerald-400" : n.type === "warn" ? "text-amber-400" : "text-indigo-400"
                        }`}>
                          //
                        </span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          SYSTEM LOG
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Persona block from Bento theme */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 pl-2 border-l border-slate-800/60 text-left cursor-pointer group focus:outline-none"
              aria-label="User Profile Dropdown"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {currentUser ? currentUser.name : "Alex Rivera"}
                </p>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  {currentUser ? (currentUser.role === "SuperAdmin" ? "SuperAdmin" : "ExternalAuditor") : "Sr. Architect"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs select-none shadow-inner group-hover:border-indigo-500/80 transition-all duration-200">
                {currentUser ? (
                  currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                ) : (
                  "AR"
                )}
              </div>
            </button>

            {showProfileDropdown && currentUser && (
              <div className="absolute right-0 mt-3.5 w-64 rounded-2xl bg-[#09090C] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 z-50 text-left font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="pb-3 border-b border-slate-850">
                  <p className="text-xs font-bold text-white leading-tight truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 break-all select-all">{currentUser.email}</p>
                </div>
                
                <div className="py-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-sans">Access clearance</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border leading-none shrink-0 ${
                      currentUser.role === "SuperAdmin" 
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}>
                      {currentUser.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Active Gateway</span>
                    <span className="font-mono text-[9px] text-slate-500">US-EAST-OIDC</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2 bg-red-950/10 hover:bg-red-950/20 border border-red-900/10 hover:border-red-500/20 rounded-xl text-red-100 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>Sign Out Session</span>
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= CORE BODY CONTAINER ================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        
        {/* ================= LEFT SIDE METRIC-NAV PANELS ================= */}
        <aside className={`w-full ${isSidebarMinimized ? "lg:w-[84px] p-4 items-center" : "lg:w-80 p-6"} bg-[#070709] border-r border-slate-900/65 flex flex-col shrink-0 gap-6 h-full overflow-hidden transition-all duration-300`}>
          
          <div className={`flex items-center ${isSidebarMinimized ? "justify-center flex-col gap-2 pb-3 w-full" : "justify-between pb-2"} border-b border-slate-900 w-full`}>
            {!isSidebarMinimized ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/55 animate-pulse" />
                  <p className="text-[10px] font-mono tracking-widest font-bold text-slate-450 uppercase leading-none">Business Intel Modules</p>
                </div>
                <button 
                  onClick={() => setIsSidebarMinimized(true)} 
                  className="p-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-450 hover:text-white transition cursor-pointer"
                  title="Minimize Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSidebarMinimized(false)} 
                className="p-1.5 bg-slate-900/50 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-slate-450 hover:text-indigo-400 transition cursor-pointer flex items-center justify-center"
                title="Maximize Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Selection Navigation */}
          <nav className={`flex-1 space-y-1.5 overflow-y-auto no-scrollbar w-full ${isSidebarMinimized ? "flex flex-col items-center" : ""}`}>
            {[
              { id: "dashboard", label: "Business Intel BI", desc: "Interactive widgets & charts", icon: LayoutDashboard },
              { id: "ledger", label: "Financial Ledger", desc: "Double-entry books & entries", icon: Receipt },
              { id: "ocr", label: "Invoice OCR AP/AR", desc: "Automated optical mapping", icon: Cpu },
              { id: "scm", label: "SCM & Forecasting", desc: "LSTM safety stock point", icon: Package },
              { id: "hr", label: "Workforce & Payroll", desc: "Gross-to-net calculators", icon: Users },
              { id: "projects", label: "Gantt Milestones", desc: "Interactive roadmap project", icon: CalendarDays },
              { id: "audit", label: "Forensic Audit Trail", desc: "Cryptographic SOC 2 checks", icon: ShieldCheck },
              { id: "api", label: "ERP API Handshakes", desc: "OpenAPI gateway logs", icon: Radio }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              
              if (isSidebarMinimized) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                    }`}
                  >
                    <IconComp className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    
                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono tracking-wider text-slate-200 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                      {tab.label}
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                  }`}
                >
                  <IconComp className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <div className="overflow-hidden leading-tight">
                    <p className={`text-xs font-semibold tracking-wider ${isActive ? "text-white" : "text-slate-200"}`}>{tab.label}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom Settings Option */}
          <div className={`mt-auto border-t border-slate-900/80 pt-4 w-full ${isSidebarMinimized ? "flex flex-col items-center gap-1" : ""}`}>
            {isSidebarMinimized ? (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  activeTab === "settings"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
                title="System Settings"
              >
                <Settings className={`w-5 h-5 shrink-0 ${activeTab === "settings" ? "text-white" : "text-slate-400"}`} />
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono tracking-wider text-slate-200 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  System Settings
                </div>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3.5 transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <Settings className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === "settings" ? "text-white" : "text-slate-400"}`} />
                <div className="overflow-hidden leading-tight">
                  <p className={`text-xs font-semibold tracking-wider ${activeTab === "settings" ? "text-white" : "text-slate-200"}`}>System Settings</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Control tenant configurations & security</p>
                </div>
              </button>
            )}
          </div>
        </aside>

        {/* ================= CENTRAL CONTENT BOARD ================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-full p-6 lg:p-8 space-y-6 no-scrollbar">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* ================= MENU: DASHBOARD Overview (F-08 BI) ================= */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Title card with gradient spotlight */}
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold rounded-full border border-indigo-500/20 uppercase tracking-widest">Active Hub</span>
                          <span className="text-slate-500 text-xs font-mono">Updated just now</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-display font-medium tracking-tight text-white leading-tight">Executive Business Intelligence</h2>
                        <p className="text-slate-400 text-xs mt-1.5 max-w-xl">Centralized ledger assets, outstanding transaction pipelines, and compliance monitors secured within Isolated Tenants scopes.</p>
                      </div>
                      <button
                        onClick={refreshDatabase}
                        className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                        title="Sync local data counters"
                      >
                        Refresh Database
                      </button>
                    </div>
                  </div>

                  {/* Top Analytics Metrics in Bento Grid Cells */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] -mr-8 -mt-8 pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Capital Pool Assets</p>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Coins className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-display font-bold mt-4 text-white">${totalAssets.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-mono font-bold">
                        ● DOUBLE-ENTRY VERIFIED
                      </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] -mr-8 -mt-8 pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Total Expenses</p>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <History className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-display font-bold mt-4 text-white">${totalExpense.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-mono">MAY-1 CONSOLIDATION</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[50px] -mr-8 -mt-8 pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Workforce Roster</p>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-display font-bold mt-4 text-white">
                        {employees.filter((e) => e.status === "ACTIVE").length} <span className="text-sm font-medium text-slate-500">/ {employees.length} active</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 font-mono">1 CURRENTLY ON LEAVE</p>
                    </div>

                    <div className="bg-[#1A1A1E] border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">SLA & Node Status</p>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
                      </div>
                      <p className="text-3xl font-display font-bold mt-4 text-white">99.98%</p>
                      <p className="text-[10px] text-emerald-400 mt-2 font-mono uppercase tracking-wider font-semibold">UPTIME: 142d 08h 12m</p>
                    </div>

                  </div>

                  {/* Business intelligence Visual Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Recharts Bar Chart explaining currency liabilities / balances */}
                    <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-52 h-52 bg-indigo-600/5 blur-[55px] -mr-16 -mt-16 pointer-events-none" />
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold tracking-wide text-white">Ledger Allocations (Debit vs Credit)</h3>
                        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">FX: USD</span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ledger.slice(0, 6)}>
                            <XAxis dataKey="accountName" stroke="#475569" fontSize={8} tickLine={false} />
                            <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#0A0A0B", border: "1px solid #1e293b", borderRadius: "12px", color: "#e2e8f0" }} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Bar dataKey="amount" name="Double Entry Delta" fill="#6366f1" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Aging schedule of outstanding Invoices */}
                    <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-52 h-52 bg-indigo-600/5 blur-[55px] -mr-16 -mt-16 pointer-events-none" />
                      <h3 className="text-sm font-semibold tracking-wide text-white mb-4">Aging Category Metrics</h3>
                      <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-6">
                        <div className="h-full flex-1 max-w-[170px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "0-30 days", value: invoices.filter((i) => i.agingCategory === "0-30 days").reduce((s, c) => s + c.amount, 0) },
                                  { name: "31-60 days", value: invoices.filter((i) => i.agingCategory === "31-60 days").reduce((s, c) => s + c.amount, 0) },
                                  { name: "61-90 days", value: invoices.filter((i) => i.agingCategory === "61-90 days").reduce((s, c) => s + c.amount, 0) },
                                  { name: "90+ days", value: invoices.filter((i) => i.agingCategory === "90+ days").reduce((s, c) => s + c.amount, 0) }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={72}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {invoices.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#0A0A0B", border: "1px solid #1e293b", borderRadius: "12px", color: "#e2e8f0" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Legends explanation list */}
                        <div className="space-y-3 shrink-0">
                          {["0-30 days", "31-60 days", "61-90 days", "90+ days"].map((cat, idx) => {
                            const val = invoices.filter((i) => i.agingCategory === cat as any).reduce((s, c) => s + c.amount, 0);
                            return (
                              <div key={cat} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                                <div className="leading-none">
                                  <span className="text-[10px] text-slate-400 font-mono block leading-none">{cat}</span>
                                  <span className="text-xs font-mono font-bold text-slate-100 mt-1 block leading-none">${val.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drilling down invoices status matrix */}
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden relative group">
                    <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold tracking-wide text-white">Outstanding Enterprise Liability Logs</h3>
                      <button
                        onClick={() => setActiveTab("ocr")}
                        className="text-xs text-indigo-400 font-semibold hover:text-indigo-350 transition flex items-center gap-1.5 cursor-pointer text-left self-start sm:self-auto"
                      >
                        Process Automation Portal &rarr;
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-[#0A0A0B]/40 text-[9px] uppercase font-mono tracking-widest border-b border-slate-800/80 text-slate-500">
                            <th className="px-6 py-4">Invoice ID</th>
                            <th className="px-6 py-4">Vendor Partner</th>
                            <th className="px-6 py-4">Confidence</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Total Amount</th>
                            <th className="px-6 py-4">Validation Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {invoices.slice(0, 3).map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-800/20 transition-all">
                              <td className="px-6 py-4 font-mono font-semibold text-indigo-400">{inv.id}</td>
                              <td className="px-6 py-4 text-slate-200 font-medium">{inv.vendor}</td>
                              <td className="px-6 py-4 font-mono">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${inv.ocrConfidence >= 0.95 ? "bg-emerald-400" : "bg-amber-400"}`} />
                                  <span>{Math.round(inv.ocrConfidence * 100)}% Match</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-400">{inv.dueDate}</td>
                              <td className="px-6 py-4 font-mono font-bold text-white">${inv.amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-[9px] rounded font-mono font-bold border ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                                    : inv.status === "APPROVED"
                                    ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/20"
                                    : "bg-amber-950/40 text-amber-400 border-amber-500/20"
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: FINANCIAL LEDGER (F-02) ================= */}
              {activeTab === "ledger" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">Financial Ledger System (GL)</h2>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Verifiable double-entry accounts with isolated ledger entities. Commit debits and credits and log manual expenditures securely.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Manual entry generation form */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-fit space-y-5 relative">
                      <div className="border-b border-slate-800/80 pb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FilePlus className="w-4 h-4 text-indigo-400" /> Issue Journal Entry
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Manual allocation of assets, revenues, or expenses.</p>
                      </div>

                      <form onSubmit={handlePostJournal} className="space-y-4 text-xs">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Account Code & Target</label>
                          <select
                            value={newJournal.accountCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              let name = "Cash & Equivalents";
                              if (code === "4000") name = "Software Sales Revenue";
                              if (code === "5020") name = "R&D Cloud Overhead";
                              if (code === "1200") name = "Office Supplies";
                              if (code === "5010") name = "Salaries Expense";
                              setNewJournal((prev) => ({ ...prev, accountCode: code, accountName: name }));
                            }}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="1010">1010 — Cash & Equivalents (Asset)</option>
                            <option value="1200">1200 — Office Supplies (Asset)</option>
                            <option value="4000">4000 — Software Sales (Revenue)</option>
                            <option value="5010">5010 — Salaries Expense (Expense)</option>
                            <option value="5020">5020 — R&D Cloud Overhead (Expense)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Transaction Delta Type</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setNewJournal((prev) => ({ ...prev, type: "DEBIT" }))}
                              className={`p-3 rounded-xl font-mono text-center border font-semibold text-xs transition-all cursor-pointer ${
                                newJournal.type === "DEBIT"
                                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                  : "bg-[#0A0A0B] border-slate-800 text-slate-400 hover:text-slate-100"
                              }`}
                            >
                              DEBIT (+)
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewJournal((prev) => ({ ...prev, type: "CREDIT" }))}
                              className={`p-3 rounded-xl font-mono text-center border font-semibold text-xs transition-all cursor-pointer ${
                                newJournal.type === "CREDIT"
                                  ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                                  : "bg-[#0A0A0B] border-[#2E2015] text-slate-400 hover:text-slate-100"
                              }`}
                            >
                              CREDIT (-)
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Transactional Value (USD)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-3 text-slate-500 font-mono font-bold">$</span>
                            <input
                              type="text"
                              required
                              value={newJournal.amount}
                              onChange={(e) => setNewJournal((prev) => ({ ...prev, amount: e.target.value }))}
                              placeholder="55000"
                              className="w-full p-3 pl-8 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Corporate Description</label>
                          <input
                            type="text"
                            required
                            value={newJournal.description}
                            onChange={(e) => setNewJournal((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Reconciling cloud bill"
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full p-3.5 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-indigo-500/20"
                        >
                          Commit Entry & Delta
                        </button>
                      </form>
                    </div>

                    {/* Ledger books tables database */}
                    <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between">
                      <div className="overflow-x-auto">
                        <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">Journal Records Ledger</h3>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">MAY 2026</span>
                        </div>
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#0A0A0B]/40 text-[9px] uppercase font-mono tracking-widest border-b border-slate-800/80 text-slate-500">
                              <th className="px-6 py-4">Tx Code</th>
                              <th className="px-6 py-4">Account Code</th>
                              <th className="px-6 py-4">Category Name</th>
                              <th className="px-6 py-4 text-center">Flow</th>
                              <th className="px-6 py-4 text-right">Amount</th>
                              <th className="px-6 py-4 text-slate-400">Auditor Actor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {ledger.map((entry) => (
                              <tr key={entry.id} className="hover:bg-slate-800/20 transition-all">
                                <td className="px-6 py-4 text-slate-400 font-bold">{entry.id}</td>
                                <td className="px-6 py-4 font-bold text-slate-300">{entry.accountCode}</td>
                                <td className="px-6 py-4 text-slate-300 font-sans">{entry.accountName}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-0.5 text-[9px] rounded font-bold ${
                                    entry.type === "DEBIT" ? "bg-indigo-950/40 text-indigo-400 border border-indigo-500/20" : "bg-amber-950/40 text-amber-500 border border-amber-500/20"
                                  }`}>
                                    {entry.type}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${
                                  entry.type === "DEBIT" ? "text-emerald-400" : "text-amber-400"
                                }`}>
                                  ${entry.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-xs font-sans text-slate-400 truncate max-w-[120px]">{entry.postedBy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: AP/AR OCR AUTOMATION (F-03) ================= */}
              {activeTab === "ocr" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">Intelligent Invoice OCR & Matching</h2>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Extract and map supplier invoices automatically. Drag-and-drop standard purchase files dynamically to trigger neural matching.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Drag and Drop Simulator module */}
                    <div className="xl:col-span-2 space-y-6">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
                          isDraggingOver
                            ? "border-indigo-500 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            : "border-slate-800 bg-slate-900/30 hover:border-slate-700/80"
                        }`}
                      >
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center rounded-xl shadow-md mb-4 shrink-0">
                          <Cpu className={`w-6 h-6 ${ocrScanning ? "animate-spin text-indigo-400" : ""}`} />
                        </div>
                        {ocrScanning ? (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-white animate-pulse">Running Optical Ingestion Scanner...</p>
                            <p className="text-xs text-slate-400 max-w-sm">Resolving bounding parameters and matching items (confidence threshold &gt; 95%).</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-white">Drag & drop raw vendor invoice PDF here</p>
                            <p className="text-xs text-slate-400">supports automated layout mapping or use the manual parameters block.</p>
                            <div className="pt-2">
                              <span className="text-[9px] px-2.5 py-1 rounded bg-[#0A0A0B] text-slate-500 border border-slate-800 font-mono">PDF, PNG, JPG accepted</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Line-item database outputs */}
                      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden relative group">
                        <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">Matched Ingress Invoices Buffer</h3>
                          <span className="text-xs text-slate-500 font-mono">REAL-TIME ISOLATION</span>
                        </div>
                        <div className="divide-y divide-slate-850 text-xs">
                          {invoices.map((inv) => (
                            <div key={inv.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-all">
                              <div className="space-y-2 max-w-md">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-indigo-400">{inv.id}</span>
                                  <span className="text-[10px] bg-[#0A0A0B] border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                    OCR CONF: {Math.round(inv.ocrConfidence * 100)}%
                                  </span>
                                  {inv.poMatchedId && (
                                    <span className="text-[9px] font-mono bg-indigo-950/40 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/25">
                                      AUTO MATCH: {inv.poMatchedId}
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-200">
                                  <span className="font-bold text-white">{inv.vendor}</span> — &nbsp;&nbsp;
                                  <span className="text-slate-400 font-medium">
                                    {inv.lineItems?.[0]?.desc ? inv.lineItems[0].desc : "Miscellaneous enterprise hardware provisioning"}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono">Due: {inv.dueDate} | Age Bracket: {inv.agingCategory}</p>
                              </div>

                              <div className="flex items-center gap-5">
                                <div className="text-right font-mono leading-tight">
                                  <p className="text-sm font-bold text-white">${inv.amount.toLocaleString()}</p>
                                  <p className="text-[9px] text-slate-500 uppercase mt-0.5">{inv.currency}</p>
                                </div>

                                {inv.status === "PENDING_MATCH" ? (
                                  <button
                                    onClick={() => handleApproveInvoice(inv.id)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve Allocation
                                  </button>
                                ) : (
                                  <span className={`px-2.5 py-1 text-[9px] rounded font-bold font-mono border ${
                                    inv.status === "PAID"
                                      ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                      : "bg-indigo-950/40 border-indigo-500/20 text-indigo-400"
                                  }`}>
                                    ● {inv.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rightside OCR Sim Form inputs */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-fit space-y-5">
                      <div className="border-b border-slate-800/80 pb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-indigo-400" /> Ingestion Simulator
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Emulate physical vendor scans.</p>
                      </div>

                      <form onSubmit={handleSubmitInvoiceOCR} className="space-y-4 text-xs">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Vendor Partner Co.</label>
                          <input
                            type="text"
                            required
                            value={newInvoiceForm.vendor}
                            onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, vendor: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Consolidated Total (USD)</label>
                          <input
                            type="text"
                            required
                            value={newInvoiceForm.amount}
                            onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, amount: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Extracted Itemization Desc</label>
                          <input
                            type="text"
                            required
                            value={newInvoiceForm.lineItemDesc}
                            onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, lineItemDesc: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={ocrScanning}
                          className="w-full p-3.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-750 text-indigo-400 font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-indigo-400" /> Start OCR Automation
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: SCM & PREDICTIVE FORECASTING (F-05, F-06) ================= */}
              {activeTab === "scm" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group flex flex-col md:flex-row items-baseline justify-between gap-4">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <div className="relative z-10">
                      <h2 className="text-2xl font-display font-medium text-white tracking-tight">SCM Logistics & AI Demand Forecasting</h2>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Integrated depot telemetry displaying stock levels, coupled with real-time 30-day LSTM forecast projection streams.</p>
                    </div>
                    <span className="relative z-10 text-[10px] bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 font-mono px-3 py-1 rounded-full font-bold uppercase animate-pulse">
                      MAPE Accuracy &gt; 88%
                    </span>
                  </div>

                  {/* SCM Stock Projection Area Chart */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                    <h3 className="text-sm font-semibold tracking-wide text-white mb-6 font-sans">LSTM Forecast Model Simulation: SKU-H100 GPU Demand (Next 30 Days)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { day: "Day 5", HistoricalDemand: 250, ForecastProjections: 250 },
                            { day: "Day 10", HistoricalDemand: 260, ForecastProjections: 275 },
                            { day: "Day 15", HistoricalDemand: 245, ForecastProjections: 290 },
                            { day: "Day 20", HistoricalDemand: 280, ForecastProjections: 310 },
                            { day: "Day 25", HistoricalDemand: 295, ForecastProjections: 340 },
                            { day: "Day 30 (Forecast)", ForecastProjections: 380 }
                          ]}
                        >
                          <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#0A0A0B", border: "1px solid #1E293B", borderRadius: "12px", color: "#F1F5F9" }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Area type="monotone" dataKey="HistoricalDemand" stroke="#6366f1" fillOpacity={0.1} fill="url(#colorHist)" name="Recorded 30-Day Demand" />
                          <Area type="monotone" dataKey="ForecastProjections" stroke="#f59e0b" fillOpacity={0.15} fill="url(#colorFore)" name="Prophet AI Forecast Vector" />
                          <defs>
                            <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Stock Level Inventory Management */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="px-6 py-5 bg-slate-900/30 border-b border-slate-800/80">
                      <h3 className="text-sm font-semibold text-white">Centralized Depot Inventory Catalog</h3>
                    </div>
                    <div className="divide-y divide-slate-850 text-xs">
                      {inventory.map((sku) => {
                        const isUnderThreshold = sku.currentStock <= sku.reorderPoint;
                        return (
                          <div key={sku.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-all">
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-indigo-400">{sku.id}</span>
                                <span className="font-bold text-white text-sm">{sku.name}</span>
                                <span className="text-[10px] bg-[#0A0A0B] text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">{sku.category}</span>
                              </div>
                              <p className="text-slate-400 text-xs">Supplier: <span className="font-semibold text-slate-300">{sku.supplier}</span></p>
                              <div className="text-[10px] text-slate-500 font-mono">Unit Cost: ${sku.unitCost} | Minimum Stock Threshold: {sku.reorderPoint} units</div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right font-mono">
                                <span className={`text-sm font-bold block ${isUnderThreshold ? "text-amber-500" : "text-white"}`}>
                                  {sku.currentStock} Units
                                </span>
                                <span className="text-[9px] text-slate-500 uppercase">DEPOT BALANCE</span>
                              </div>

                              {isUnderThreshold ? (
                                <button
                                  onClick={() => handleRestockSku(sku.id, 200)}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                                  title="Triggers PO to supplier & General Ledger entries"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Replenish Stock (+200)
                                </button>
                              ) : (
                                <span className="px-3 py-1.5 bg-[#0A0A0B] text-slate-500 text-[10px] rounded-xl font-mono border border-slate-800">
                                  Safety stock safe
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: WORKFORCE & PAYROLL (F-04) ================= */}
              {activeTab === "hr" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group flex flex-col sm:flex-row items-baseline justify-between gap-4">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <div className="relative z-10 text-left">
                      <h2 className="text-2xl font-display font-medium text-white tracking-tight">Workforce Lifecycle & Payroll</h2>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-xl">Administer active rosters, submit secure leave balances, and trigger automated multi-currency salaries in single-batch streams.</p>
                    </div>
                    <button
                      onClick={handleRunPayrollCycle}
                      className="relative z-10 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all border border-indigo-500/30"
                    >
                      <UserCheck className="w-4 h-4" /> Clear Batch Salaries 
                    </button>
                  </div>

                  {/* Employees Database Grid & Leave Submission Form */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Catalog listing */}
                    <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                      <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white font-sans">Active Employees Lifecycle Directory</h3>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Tenant Secured</span>
                      </div>
                      <div className="divide-y divide-slate-850 text-xs">
                        {employees.map((emp) => (
                          <div key={emp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-all">
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-indigo-400">{emp.id}</span>
                                <span className="font-semibold text-white text-sm">{emp.name}</span>
                                <span className={`px-2 py-0.5 text-[8px] rounded font-bold font-mono ${
                                  emp.status === "ACTIVE"
                                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-950/40 text-amber-500 border border-amber-500/20"
                                }`}>
                                  {emp.status}
                                </span>
                              </div>
                              <p className="text-slate-400">{emp.role} &nbsp;|&nbsp; <span className="text-indigo-400 font-semibold">{emp.department}</span></p>
                              <p className="text-[10px] text-slate-500 font-mono">{emp.email}</p>
                            </div>

                            <div className="flex items-center gap-6 text-right font-mono">
                              <div>
                                <p className="text-sm font-bold text-white">${emp.baseSalary.toLocaleString()}/mo</p>
                                <p className="text-[10px] text-slate-500">Leaves: {emp.leavesTaken} taken / {emp.accruedLeaves} left</p>
                              </div>
                              <div className="w-24 text-center">
                                {emp.recentPayrollPaid ? (
                                  <span className="px-2.5 py-1 text-[9px] font-bold rounded-xl font-mono bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
                                    PAID (MAY)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[9px] font-bold rounded-xl font-mono bg-amber-950/30 border border-amber-500/20 text-amber-500">
                                    UNPAID
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Leave Submission panel format */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-fit space-y-5">
                      <div className="border-b border-slate-800/80 pb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-400" /> Lodge Staff Leaves
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Deduct balances from allocated quotas.</p>
                      </div>

                      <form onSubmit={handleLeaveSubmission} className="space-y-4 text-xs">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Target Team Member</label>
                          <select
                            value={leaveForm.employeeId}
                            onChange={(e) => setLeaveForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 outline-none focus:border-indigo-500 text-xs"
                          >
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Requested Days</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            required
                            value={leaveForm.days}
                            onChange={(e) => setLeaveForm((prev) => ({ ...prev, days: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 font-mono outline-none focus:border-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full p-3.5 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-indigo-500/20"
                        >
                          Submit Approval
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: COMPLIANCE GANTT MILESTONES (F-07) ================= */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">Project Gantt Timelines</h2>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Track milestone progressions, resource mappings, and core timeline tasks across engineering and operations quadrants.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Multi Track Gantt Renderer panel */}
                    <div className="xl:col-span-2 space-y-6">
                      {projects.map((proj) => {
                        const isBudgetWarning = proj.actualSpent > proj.budget;
                        return (
                          <div key={proj.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                            
                            {/* Project Header details */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-indigo-400">{proj.id}</span>
                                  <h3 className="font-bold text-white text-sm">{proj.name}</h3>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Project Lead: <span className="font-semibold text-slate-300">{proj.lead}</span></p>
                              </div>

                              <div className="text-right font-mono">
                                <div className="text-xs text-slate-300">
                                  Budget Spent: <span className={`font-bold ${isBudgetWarning ? "text-amber-500 animate-pulse" : "text-white"}`}>
                                    ${proj.actualSpent.toLocaleString()}
                                  </span> / ${proj.budget.toLocaleString()}
                                </div>
                                {isBudgetWarning && (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-amber-950/40 font-bold border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded mt-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> BUDGET EXCEEDED VARIANCE
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Chronos Timeline Bars Renderer */}
                            <div className="space-y-4 pt-2 text-xs text-left">
                              {proj.tasks.map((task) => (
                                <div key={task.id} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-mono font-semibold text-slate-300">{task.name} ({task.dept})</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{task.start} to {task.end} ({task.progress}%)</span>
                                  </div>
                                  <div className="w-full bg-[#0A0A0B] h-3 rounded-full overflow-hidden border border-slate-800/85 relative">
                                    <div
                                      style={{ width: `${task.progress}%` }}
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        task.status === "DONE" ? "bg-indigo-500" : "bg-indigo-700"
                                      }`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Gantt Milestone Task Addition Form */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-fit space-y-5">
                      <div className="border-b border-slate-800/80 pb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-400" /> Append Task Milestone
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Lodge a scheduled workforce track.</p>
                      </div>

                      <form onSubmit={handleAddGanttTask} className="space-y-4 text-xs">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Target Project Code</label>
                          <select
                            value={newGanttTask.projectId}
                            onChange={(e) => setNewGanttTask((prev) => ({ ...prev, projectId: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Task Action Label</label>
                          <input
                            type="text"
                            required
                            value={newGanttTask.taskName}
                            onChange={(e) => setNewGanttTask((prev) => ({ ...prev, taskName: e.target.value }))}
                            placeholder="Data model preparation"
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Executing Team</label>
                          <select
                            value={newGanttTask.dept}
                            onChange={(e) => setNewGanttTask((prev) => ({ ...prev, dept: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-indigo-550/20"
                        >
                          Lodge Task Timeline
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: FORENSIC COMPLIANCE AUDIT TRAIL (F-09) ================= */}
              {activeTab === "audit" && (
                <div className="space-y-6 text-left">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">Cryptographic Integrity Audit (SOC 2)</h2>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Verifiable, tamper-evident corporate audit ledger chained with secure SHA-256 blocks preventing database intrusion.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Diagnostic Verifier tool */}
                    <div className="xl:col-span-2 space-y-6 font-sans">
                      
                      {/* Telemetry Output box */}
                      {verificationResult && (
                        <div className={`p-6 rounded-3xl border border-dashed flex flex-col sm:flex-row items-baseline justify-between gap-4 transition-all duration-300 ${
                          verificationResult.isValid
                            ? "bg-emerald-950/20 border-emerald-500/25"
                            : "bg-red-950/20 border-red-500/25"
                        }`}>
                          <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                              {verificationResult.isValid ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs bg-emerald-950/50 border border-emerald-500/25 px-2.5 py-1 rounded-full font-mono">
                                  <Check className="w-3.5 h-3.5 text-emerald-400" /> SECURE (100% VALID)
                                </span>
                              ) : (
                                <span className="text-red-400 font-bold flex items-center gap-1.5 text-xs bg-red-950 border border-red-500/20 px-2.5 py-1 rounded-full animate-pulse">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> INTRUSION WARNING
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono">Sequence blocks checked: {verificationResult.totalSequenceChecked}</span>
                            </div>
                            <h3 className="font-bold text-white text-xs mt-1">Authority Ref: {verificationResult.governingAuthority}</h3>
                            <p className="text-[10px] text-slate-500 font-mono">Timestamp verified: {verificationResult.timestamp}</p>
                          </div>
                        </div>
                      )}

                      {/* Timeline Ledger audit cards lists */}
                      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="px-6 py-5 bg-slate-900/30 border-b border-slate-800/80 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">Hash-Chained System Mutations</h3>
                        </div>
                        <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                          {auditLogs.map((log) => (
                            <div key={log.sequence} className="relative border-l border-slate-800 pl-6 pb-2 last:border-0 last:pb-0">
                              <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-[#0A0A0B]" />
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-mono font-bold text-slate-400">#Block-{log.sequence}</span>
                                  <span className="text-[10px] bg-[#0A0A0B] text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">{log.module}</span>
                                  <span className="font-mono text-slate-500 text-[10px] ml-auto">{log.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-200 italic">&ldquo;{log.description}&rdquo;</p>
                                <div className="space-y-1 pt-1 font-mono text-[9px] text-slate-500">
                                  <p className="truncate"><span className="text-slate-400 font-semibold">Prev Hash:</span> {log.prevHash}</p>
                                  <p className="truncate"><span className="text-indigo-400 font-bold">This Hash:</span> {log.txHash}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Controller Action triggers */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-fit space-y-5">
                      <div className="border-b border-slate-800/80 pb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-sans">
                          <Lock className="w-4 h-4 text-indigo-400" /> Cryptographic Ledger Controller
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Computes cumulative SHA-256 block hash parameters across general ledger changes to mathematically verify 0 illicit edits.</p>
                      </div>

                      <button
                        onClick={handleVerifyComplianceChain}
                        disabled={isVerifying}
                        className="w-full p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 transition"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Computing Chain Hashes...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" /> Verify Compliance Cryptography
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: API HANDSHAKES (F-11) ================= */}
              {activeTab === "api" && (
                <div className="space-y-6 text-left">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">Enterprise OpenAPI Gateway Sandbox</h2>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Trigger real-time sandbox APIs and monitor live OIDC core events directly using integrated corporate webhook contracts.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5 font-mono text-xs">
                      <div className="border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-sans font-semibold text-white">OIDC Endpoint Contracts</h3>
                        <p className="text-[10px] text-slate-500 font-mono">HTTPS REST protocols available under tenants</p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-[#0A0A0B] border border-slate-850 rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">GET</span>
                            <span className="font-bold text-white text-[11px]">/api/ledger</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 font-sans">Query multi-category General Ledger indices.</p>
                        </div>

                        <div className="p-4 bg-[#0A0A0B] border border-slate-850 rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">POST</span>
                            <span className="font-bold text-white text-[11px]">/api/invoices</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 font-sans">Submit inbound supplier invoice payloads directly.</p>
                        </div>

                        <div className="p-4 bg-[#0A0A0B] border border-slate-850 rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">POST</span>
                            <span className="font-bold text-white text-[11px]">/api/audit-logs/verify</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 font-sans">Trigger cryptographic tamper validation processes.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                      <div className="border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-semibold text-white">Active Dispatcher Webhooks</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Real-time mutation streams</p>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-4 bg-[#0A0A0B] border border-slate-850 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                            <span className="font-bold text-white uppercase text-xs">SCM_ALERT_EVENT</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-2 font-sans">Dispatches real-time stock alert records automatically when safety thresholds breach.</p>
                          <span className="block text-[10px] text-slate-400 bg-[#0A0A0B]/80 px-2.5 py-1.5 border border-slate-850 rounded-xl truncate text-left font-mono">https://webhooks.amdox.io/scm-gateway</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MENU: SYSTEM SETTINGS ================= */}
              {activeTab === "settings" && (
                <div className="space-y-6 text-left">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[90px] -mr-24 -mt-24 pointer-events-none" />
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold rounded-full border border-indigo-500/20 uppercase tracking-widest">Admin Panel</span>
                          <span className="text-slate-500 text-xs font-mono">Kernel Config v4.0.2</span>
                        </div>
                        <h2 className="text-2xl font-display font-medium text-white tracking-tight">System Settings</h2>
                        <p className="text-xs text-slate-400 mt-1.5 max-w-xl text-left">Manage tenant parameters, authorization scopes, cryptographic audit preferences, and interface controls.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Role & Audit Scopes Container */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                      <div className="border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-semibold text-white">Identity & Authorization Scope</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Assumed identity role during ledger auditing</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-[#0A0A0B] border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Current Role Scope</p>
                            <p className="text-[10.5px] text-slate-400 mt-0.5 font-sans">Controls read/write capability to cryptographic ledger locks.</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider border leading-none shrink-0 ${
                            userRole === "SuperAdmin" 
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {userRole.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setUserRole("SuperAdmin");
                              addNotification("User authorization upgraded back to SuperAdmin security scope.", "success");
                            }}
                            className={`p-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                              userRole === "SuperAdmin"
                                ? "bg-indigo-600 text-white border-indigo-500"
                                : "bg-[#0A0A0B] text-slate-400 border-slate-850 hover:text-white hover:border-slate-800"
                            }`}
                          >
                            Set SuperAdmin
                          </button>
                          <button
                            onClick={() => {
                              setUserRole("ExternalAuditor");
                              addNotification("User security scope restricted to ExternalAuditor read-only policies.", "warn");
                            }}
                            className={`p-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                              userRole === "ExternalAuditor"
                                ? "bg-amber-600 text-white border-amber-500"
                                : "bg-[#0A0A0B] text-slate-400 border-slate-850 hover:text-white hover:border-slate-800"
                            }`}
                          >
                            Set ExternalAuditor
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SOC 2 Policy Controls */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                      <div className="border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-semibold text-white">Auditing & Security Policies</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Strict compliance validation parameters</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-mono uppercase text-slate-500">Cryptographic Ruleset</label>
                          <select
                            value={securityPolicy}
                            onChange={(e) => {
                              setSecurityPolicy(e.target.value);
                              addNotification(`Cryptographic validation rules updated to compliance level: ${e.target.value}.`, "success");
                            }}
                            className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                          >
                            <option value="Strict-SOC2">Strict-SOC2 (SHA-256 Block Signature Checks)</option>
                            <option value="Moderate-ISO">Moderate-ISO (Standard Checksums)</option>
                            <option value="Permissive-Dev">Permissive-Dev (No Audits Signature Sandbox)</option>
                          </select>
                        </div>

                        <div className="pt-2">
                          <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-[11px] text-slate-400 leading-relaxed font-sans">
                            <span className="font-bold text-indigo-400">Compliance Advisory:</span> Changes to active verification modules require immediate re-handshake signature checks across linked active dispatchers on the gateway.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial alert thresholds */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                      <div className="border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-semibold text-white">Financial Alarm Guardrails</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Define audit alarm triggers for high-value bookings</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-mono uppercase text-slate-500">Journal Single-Entry Limit Alert (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3.5 text-[10px] font-mono text-slate-500">USD</span>
                            <input
                              type="number"
                              className="w-full p-3 pl-11 rounded-xl bg-[#0A0A0B] border border-slate-800 text-slate-200 outline-none focus:border-indigo-500 text-xs"
                              value={highValueThreshold}
                              onChange={(e) => setHighValueThreshold(e.target.value)}
                              placeholder="e.g. 50000"
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono italic">Entries exceeding this limit automatically mark as [PENDING_SUPERADMIN_SIGN].</p>
                        </div>

                        <div className="p-4 bg-[#0A0A0B] border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Real-time Sandbox Autosync</p>
                            <p className="text-[10.5px] text-slate-400 mt-0.5 font-sans">Keep system metrics automatically synchronizing in background</p>
                          </div>
                          <button
                            onClick={() => {
                              setIsAutoRefresh(!isAutoRefresh);
                              addNotification(`Autosync status flipped to ${!isAutoRefresh ? "Enabled" : "Disabled"}.`, "success");
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                              isAutoRefresh
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-950/50 text-slate-500 border-slate-850"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isAutoRefresh ? "bg-emerald-400" : "bg-slate-600"}`} />
                            {isAutoRefresh ? "Active" : "Paused"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance operations */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
                      <div className="border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-semibold text-white">Database Core Diagnostics</h3>
                        <p className="text-[10px] text-slate-500 font-mono">Maintenance routines for local ledger datasets</p>
                      </div>

                      <div className="space-y-3 pt-1">
                        <button
                          onClick={() => {
                            addNotification(`Executing dynamic schema index rebuilds across current tenant ${currentTenant}...`, "success");
                            setTimeout(() => {
                              addNotification("Schema indices rebuilt successfully. Database performance optimized.", "success");
                            }, 1200);
                          }}
                          className="w-full text-left p-3.5 bg-[#0A0A0B] hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl transition cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Rebuild Database Index Buffers</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Purges old query plans and reconstructs partition B-trees</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-2">RUN &rarr;</span>
                        </button>

                        <button
                          onClick={() => {
                            addNotification("Purging transient event stream log history...", "warn");
                            setTimeout(() => {
                              addNotification("Successfully removed 14 ephemeral system logs.", "success");
                            }, 1000);
                          }}
                          className="w-full text-left p-3.5 bg-[#0A0A0B] hover:bg-[#09090C] border border-slate-850 hover:border-slate-800 rounded-2xl transition cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Clear Transient Logs Channel</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Safely removes completed webhooks alert payloads</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-2">RUN &rarr;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ================= FLOATING CHATBOT WIDGET: INTEL GEMINI ASSISTANT ================= */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-[350px] sm:w-[380px] h-[550px] bg-[#0A0A0D] border border-slate-800/90 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden backdrop-blur-md"
              >
                {/* Assist Header branding */}
                <div className="p-4 border-b border-slate-850 flex items-center justify-between gap-2 bg-slate-900/40 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg text-white font-sans font-semibold">
                      <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: "6s" }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                        AMDOX Intelligent Desk
                      </h3>
                      <p className="text-[9px] text-slate-400 font-mono lowercase mt-0.5">Gemini GenAI-Powered Copilot</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Close Copilot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick interactive trigger shortcut tags */}
                <div className="p-2.5 bg-slate-950/20 border-b border-slate-850 flex gap-2 overflow-x-auto select-none no-scrollbar">
                  {[
                    { label: "SCM Shortages", prompt: "Summarize current material shortages in inventory, focusing on SKU reorder thresholds." },
                    { label: "Check Overruns", prompt: "Identify and audit active corporate projects currently exhibiting budget variance overruns." },
                    { label: "Verify Integrity", prompt: "Audit compliance logs, double-entry ledgers and output a security confirmation." }
                  ].map((shortcut) => (
                    <button
                      key={shortcut.label}
                      onClick={() => handleAskCopilot(shortcut.prompt)}
                      disabled={isCopilotLoading}
                      className="shrink-0 bg-[#0A0A0B] text-[9px] px-2.5 py-1.5 border border-slate-800 rounded-full text-slate-300 font-mono hover:border-indigo-500 hover:text-white transition cursor-pointer"
                    >
                      {shortcut.label}
                    </button>
                  ))}
                </div>

                {/* Chat History Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs select-text text-left no-scrollbar">
                  {copilotHistory.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl max-w-[90%] space-y-1.5 transition ${
                        m.sender === "user"
                          ? "bg-indigo-600/10 border border-indigo-500/20 ml-auto text-slate-200"
                          : "bg-slate-900/30 border border-slate-850 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[9px] font-mono text-slate-500 font-bold border-b border-slate-850 pb-1">
                        <span>{m.sender === "user" ? "YOU" : "AMDOX CO-PILOT"}</span>
                        {m.simulated && (
                          <span className="text-yellow-500 flex items-center gap-0.5 animate-pulse">
                            <Sparkles className="w-2.5 h-2.5" /> Simulation
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed select-text break-words whitespace-pre-wrap font-sans">{m.text}</p>
                    </div>
                  ))}
                  {isCopilotLoading && (
                    <div className="bg-[#0A0A0B] border border-slate-850 p-3 rounded-2xl max-w-[90%] space-y-2 text-left">
                      <p className="text-[9px] font-mono text-slate-500 animate-pulse font-bold">CONTACTING GEMINI BRAIN SERVICE...</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>

                {/* Assistant input keyboard controls */}
                <div className="p-3 bg-slate-950/40 border-t border-slate-850">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask about budgets or audits..."
                      value={copilotQuery}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isCopilotLoading) {
                          handleAskCopilot();
                        }
                      }}
                      onChange={(e) => setCopilotQuery(e.target.value)}
                      className="flex-1 bg-[#0A0A0B] text-slate-150 placeholder-slate-500 rounded-xl border border-slate-800 px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-left font-sans"
                      disabled={isCopilotLoading}
                    />
                    <button
                      onClick={() => handleAskCopilot()}
                      disabled={isCopilotLoading || !copilotQuery.trim()}
                      className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Logo Chat Button Bubble */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 duration-200 ${
              isChatOpen
                ? "bg-slate-800 border border-slate-700 text-white shadow-slate-900/40"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
            }`}
            title="Toggle AMDOX Copilot Assistant"
          >
            {isChatOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <div className="relative">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-600 animate-ping" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
