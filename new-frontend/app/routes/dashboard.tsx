import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Modal } from "~/components/ui/modal";
import { AlertDialog } from "~/components/ui/alert-dialog";
import { CopyWallet } from "~/components/ui/copy-wallet";
import { TxHashDisplay } from "~/components/ui/tx-hash-display";
import { EmployeeFormSheet } from "~/components/dashboard/EmployeeFormSheet";
import { DashboardProvider, useDashboard } from "~/contexts/DashboardContext";
import { useStarkzap } from "~/contexts/StarkzapContext";
import { useToast } from "~/contexts/ToastContext";
import { Sidebar } from "~/components/dashboard/Sidebar";
import { Topbar } from "~/components/dashboard/Topbar";
import { CommandPalette } from "~/components/dashboard/CommandPalette";
import { Overview } from "~/components/dashboard/Overview";
import { StarkZapSwapView } from "~/components/dashboard/StarkZapSwapView";
import { TongoView } from "~/components/dashboard/TongoView";
import { TransferHistoryView } from "~/components/dashboard/TransferHistoryView";
import type { Employee } from "~/state/companyStore";
import type { EmployeeFormValues } from "~/lib/employeeSchema";
import { useCompanyStore, mockTxHash } from "~/state/companyStore";
import { isTongoConfigured, buildTransferCall } from "~/lib/tongo";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCheck,
  DollarSign,
  Send,
  Search,
  Plus,
  Pencil,
  Trash2,
  History,
  Wallet,
  LogOut,
  Loader2,
  Shield,
} from "lucide-react";

const TONGO_KEY_STORAGE = "company_tongo_private_key";

export function meta() {
  return [
    { title: "Dashboard · Company Employee Management" },
    { name: "description", content: "Manage employees and transfers" },
  ];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40,64}$/.test(addr.trim());
}

/** Dashboard uses useAccount(); StarknetConfig is client-only, so we must not render it during SSR. */
function DashboardClientOnly() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading dashboard…</p>
      </div>
    );
  }
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}

export default function Dashboard() {
  return <DashboardClientOnly />;
}

function DashboardLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get("view") || "overview";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { toast } = useToast();
  const demoMode = useCompanyStore((s) => s.demoMode);
  const setDemoMode = useCompanyStore((s) => s.setDemoMode);
  const storeWallet = useCompanyStore((s) => s.wallet);
  const setStarkzapWalletStore = useCompanyStore((s) => s.setStarkzapWallet);
  const addTransferUnified = useCompanyStore((s) => s.addTransfer);
  const seedDemoData = useCompanyStore((s) => s.seedDemoData);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { wallet: starkzapWallet, connecting: starkzapConnecting, connectStarkzap, disconnectStarkzap } = useStarkzap();
  const tongoConfigured = isTongoConfigured();
  const connectedViaStarkzap = !!starkzapWallet;
  const connectedViaWallet = isConnected;
  const mockConnected = storeWallet.connected && storeWallet.mode === "mock";
  const anyConnected = connectedViaStarkzap || connectedViaWallet || mockConnected;
  const [activeSource, setActiveSource] = useState<"wallet" | "starkzap" | "mock">(
    mockConnected ? "mock" : connectedViaStarkzap ? "starkzap" : "wallet"
  );

  useEffect(() => {
    if (activeSource === "starkzap" && !connectedViaStarkzap) setActiveSource(mockConnected ? "mock" : "wallet");
    if (activeSource === "wallet" && !connectedViaWallet && (connectedViaStarkzap || mockConnected)) setActiveSource(connectedViaStarkzap ? "starkzap" : "mock");
    if (activeSource === "mock" && !mockConnected) setActiveSource(connectedViaStarkzap ? "starkzap" : "wallet");
  }, [activeSource, connectedViaStarkzap, connectedViaWallet, mockConnected]);

  useEffect(() => {
    // Mirror Starkzap connection into our global wallet state so other pages work consistently.
    if (starkzapWallet?.address) {
      setStarkzapWalletStore(starkzapWallet.address, demoMode ? { STRK: 5000, ETH: 2.5, USDC: 10000 } : undefined);
    }
  }, [starkzapWallet?.address, setStarkzapWalletStore, demoMode]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigate("/dashboard?view=employees&add=1");
      }
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigate("/dashboard?view=transfers&transfer=1");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [navigate]);

  async function runFullDemo() {
    seedDemoData();
    toast("Step 1: Seeding demo data…");
    await new Promise((r) => setTimeout(r, 2000));
    const state = useCompanyStore.getState();
    const emp = state.employees[0] || {
      name: "Demo User",
      address: "0x04a1d2c3b4a5968778695a4b3c2d1e0f04a17e3b04a1d2c3b4a5968778695a4b",
    };
    const fromAddr = storeWallet.connected ? storeWallet.address : "Company";
    toast("Step 2: StarkZap transfer…");
    addTransferUnified({
      type: "starkzap",
      from: fromAddr,
      to: { name: emp.name, address: emp.address },
      amount: 2500,
      token: "STRK",
      txHash: mockTxHash(),
      status: "completed",
      private: false,
    });
    await new Promise((r) => setTimeout(r, 2000));
    toast("Step 3: Tongo private transfer…");
    addTransferUnified({
      type: "tongo",
      from: "Tongo Pool",
      to: { name: emp.name, address: emp.address },
      amount: 1500,
      token: "USDC",
      txHash: mockTxHash(),
      status: "completed",
      private: true,
    });
    await new Promise((r) => setTimeout(r, 2000));
    toast("Step 4: Opening transfer history.");
    navigate("/dashboard?view=history");
  }

  const walletSection = (
    <>
      {tongoConfigured && (
        <span className="text-xs text-zinc-500">Tongo</span>
      )}
      <div className="flex items-center gap-2">
        {/* Mock wallet (demo mode) */}
        {mockConnected && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2 py-1">
            <span className="text-xs font-medium text-emerald-500/90">Demo</span>
            <span className="text-xs font-mono text-zinc-500 truncate max-w-[90px]" title={storeWallet.address}>
              {storeWallet.address.slice(0, 6)}…{storeWallet.address.slice(-4)}
            </span>
            <span className="text-xs text-zinc-400">
              {storeWallet.balances.STRK.toLocaleString()} STRK
            </span>
          </div>
        )}
        {/* Injected wallet */}
        {!connectedViaWallet && !mockConnected && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => connectors[0] && connect({ connector: connectors[0] })}
            disabled={connectors.length === 0}
          >
            <Wallet className="size-4 mr-1" />
            Connect wallet
          </Button>
        )}
        {connectedViaWallet && !mockConnected && (
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1 dark:border-zinc-800">
            <span className="text-xs font-mono text-zinc-500 truncate max-w-[90px]" title={address}>
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </span>
            <Button
              size="sm"
              variant={activeSource === "wallet" ? "default" : "secondary"}
              onClick={() => setActiveSource("wallet")}
              disabled={!connectedViaWallet}
            >
              {activeSource === "wallet" ? "Active" : "Use"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => disconnect()} title="Disconnect wallet">
              <LogOut className="size-4" />
            </Button>
          </div>
        )}

        {/* Starkzap */}
        {!connectedViaStarkzap ? (
          <Button
            size="sm"
            onClick={async () => {
              try {
                toast("Opening Starkzap…");
                const w = await connectStarkzap();
                setStarkzapWalletStore(w.address, demoMode ? { STRK: 5000, ETH: 2.5, USDC: 10000 } : undefined);
                toast(`Starkzap connected: ${w.address.slice(0, 6)}…${w.address.slice(-4)}`);
              } catch (e) {
                toast(e instanceof Error ? e.message : "Starkzap sign-in failed. Enable Demo Mode to simulate.");
              }
            }}
            disabled={starkzapConnecting}
            className="bg-amber-600 hover:bg-amber-700 text-white border-0"
          >
            {starkzapConnecting ? <Loader2 className="size-4 mr-1.5 animate-spin shrink-0" /> : null}
            Sign in with Starkzap
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-1">
            <span className="text-xs font-medium text-amber-500/90">Starkzap</span>
            <span className="text-xs font-mono text-zinc-500 truncate max-w-[90px]" title={starkzapWallet!.address}>
              {starkzapWallet!.address.slice(0, 6)}…{starkzapWallet!.address.slice(-4)}
            </span>
            <Button
              size="sm"
              variant={activeSource === "starkzap" ? "default" : "secondary"}
              onClick={() => setActiveSource("starkzap")}
              disabled={!connectedViaStarkzap}
            >
              {activeSource === "starkzap" ? "Active" : "Use"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => disconnectStarkzap()} title="Disconnect Starkzap">
              <LogOut className="size-4" />
            </Button>
          </div>
        )}

        <span className="text-zinc-600 dark:text-zinc-500">·</span>
        <Link to="/">
          <Button variant="ghost" size="sm">Home</Button>
        </Link>
      </div>
    </>
  );

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((s) => !s)}
          view={view}
        />
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar
            view={view}
            onOpenCommand={() => setCommandOpen(true)}
            walletSection={walletSection}
            demoMode={demoMode}
            onToggleDemoMode={setDemoMode}
            onRunFullDemo={runFullDemo}
          />
          <main className="flex-1 p-6 overflow-auto">
            {view === "overview" && <Overview />}
            {view === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="page-title">Settings</h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Configure your workspace and preferences
                  </p>
                </div>
                <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur dark:bg-zinc-950/30 shadow-sm max-w-xl">
                  <CardContent className="pt-6">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      More settings options will appear here. For now, use the Demo toggle in the header to try the app with sample data, or connect a wallet to use live features.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            {(view === "employees" || view === "transfers") && (
              <DashboardContent activeSource={activeSource} />
            )}
            {view === "starkzap" && <StarkZapSwapView />}
            {view === "tongo" && <TongoView />}
            {view === "history" && <TransferHistoryView />}
          </main>
        </div>
      </div>
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        view={view}
      />
    </>
  );
}

function DashboardContent({ activeSource }: { activeSource: "wallet" | "starkzap" | "mock" }) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { account, isConnected } = useAccount();
  const { wallet: starkzapWallet } = useStarkzap();
  const {
    employees,
    transfers,
    addEmployee,
    updateEmployee,
    removeEmployee,
    addTransfer: addTransferLegacy,
  } = useDashboard();
  const wallet = useCompanyStore((s) => s.wallet);
  const addTransferUnified = useCompanyStore((s) => s.addTransfer);
  const [search, setSearch] = useState("");
  const [employeeSheetOpen, setEmployeeSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<"form" | "summary">("form");
  const [transferPending, setTransferPending] = useState(false);

  // URL-driven open: ?add=1 opens employee sheet, ?transfer=1 opens transfer modal
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditingEmployee(null);
      setEmployeeSheetOpen(true);
      const view = searchParams.get("view") || "employees";
      navigate(`/dashboard?view=${view}`, { replace: true });
    }
  }, [searchParams.get("add"), navigate]);
  useEffect(() => {
    if (searchParams.get("transfer") === "1") {
      setTransferModalOpen(true);
      const view = searchParams.get("view") || "transfers";
      navigate(`/dashboard?view=${view}`, { replace: true });
    }
  }, [searchParams.get("transfer"), navigate]);

  const [transferEmployeeId, setTransferEmployeeId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");

  const [companyTongoKey, setCompanyTongoKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(TONGO_KEY_STORAGE) ?? "";
  });

  const tongoConfigured = isTongoConfigured();
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === "active"),
    [employees]
  );
  const totalPayroll = useMemo(
    () => activeEmployees.reduce((s, e) => s + e.salary, 0),
    [activeEmployees]
  );
  const totalTransferred = useMemo(
    () => transfers.reduce((s, t) => s + t.amount, 0),
    [transfers]
  );

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const selectedEmployee = transferEmployeeId
    ? activeEmployees.find((e) => e.id === transferEmployeeId)
    : null;

  const usingStarkzap = activeSource === "starkzap";
  const activeConnected = usingStarkzap ? !!starkzapWallet : isConnected;
  const activeAccount = usingStarkzap ? starkzapWallet : account;

  const canUseTongoTransfer =
    tongoConfigured &&
    activeConnected &&
    !!activeAccount &&
    companyTongoKey.trim() !== "" &&
    !!selectedEmployee?.tongoPublicKey?.trim();


  const transferFormValid =
    transferEmployeeId !== "" &&
    transferAmount.trim() !== "" &&
    Number(transferAmount) > 0;

  function openAddEmployee() {
    setEditingEmployee(null);
    setEmployeeSheetOpen(true);
  }

  function openEditEmployee(emp: Employee) {
    setEditingEmployee(emp);
    setEmployeeSheetOpen(true);
  }

  function handleEmployeeFormSubmit(values: EmployeeFormValues, isEdit: boolean, existingId?: string) {
    const payload = {
      name: values.name,
      role: values.role,
      department: values.department,
      salary: values.salary,
      address: values.address,
      status: values.status,
      hireDate: values.hireDate,
      tongoPublicKey: values.tongoPublicKey?.trim() || undefined,
    };
    if (isEdit && existingId) {
      updateEmployee(existingId, payload);
      toast("Employee updated.");
    } else {
      addEmployee(payload);
      toast("Employee added.");
    }
    setEmployeeSheetOpen(false);
  }

  function confirmDelete() {
    if (deleteTarget) {
      removeEmployee(deleteTarget.id);
      toast("Employee removed.");
      setDeleteTarget(null);
    }
  }

  function openTransferModal() {
    setTransferStep("form");
    setTransferEmployeeId("");
    setTransferAmount("");
    setTransferNote("");
    setTransferModalOpen(true);
  }

  function goToTransferSummary() {
    if (!transferFormValid || !selectedEmployee) return;
    setTransferStep("summary");
  }

  async function confirmTransfer() {
    if (!selectedEmployee || !transferAmount.trim() || Number(transferAmount) <= 0)
      return;
    const amount = Number(transferAmount);
    const amountBaseUnits = BigInt(Math.round(amount * 1e6));

    if (canUseTongoTransfer && activeAccount) {
      setTransferPending(true);
      try {
        const call = await buildTransferCall(
          companyTongoKey.trim(),
          selectedEmployee.tongoPublicKey!.trim(),
          amountBaseUnits
        );
        if (!call) {
          toast("Failed to build Tongo transfer.");
          return;
        }
        const executeCall = {
          contractAddress: call.contractAddress as `0x${string}`,
          entrypoint: call.entrypoint,
          calldata: call.calldata,
        };
        let txHash: string;
        if (usingStarkzap && starkzapWallet) {
          const result = await starkzapWallet.execute([executeCall]);
          txHash = (result as { transaction_hash?: string })?.transaction_hash ?? mockTxHash();
        } else if (account) {
          const result = await account.execute(executeCall);
          txHash = (result as { transaction_hash?: string })?.transaction_hash ?? mockTxHash();
        } else {
          txHash = mockTxHash();
        }
        const fromAddr = wallet.connected ? wallet.address : "Company";
        addTransferUnified({
          type: "tongo",
          from: fromAddr,
          to: { name: selectedEmployee.name, address: selectedEmployee.address },
          amount,
          token: "USDC",
          txHash,
          status: "completed",
          note: transferNote.trim() || undefined,
          private: true,
        });
        toast("Transfer sent (private, Tongo).");
        setTransferModalOpen(false);
        setTransferAmount("");
        setTransferNote("");
        setTransferEmployeeId("");
      } catch (e) {
        console.error(e);
        toast(e instanceof Error ? e.message : "Tongo transfer failed.");
      } finally {
        setTransferPending(false);
      }
      return;
    }

    const fromAddr = wallet.connected ? wallet.address : "Company";
    addTransferUnified({
      type: usingStarkzap ? "starkzap" : "direct",
      from: fromAddr,
      to: { name: selectedEmployee.name, address: selectedEmployee.address },
      amount,
      token: "USDC",
      txHash: mockTxHash(),
      status: "completed",
      note: transferNote.trim() || undefined,
      private: false,
    });
    toast("Transfer sent.");
    setTransferModalOpen(false);
  }

  return (
    <>
    <div className="max-w-6xl mx-auto space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/15 text-blue-500">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Total Employees</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{employees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/15 text-emerald-500">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Active Employees</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{activeEmployees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/15 text-amber-500">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Total Monthly Payroll</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    ${totalPayroll.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-violet-500/15 text-violet-500">
                  <Send className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Total Transferred</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    ${totalTransferred.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees section */}
        <Card className="border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/30 mb-8">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Employees
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={openTransferModal}>
                <Send className="size-4 mr-1" />
                New Transfer
              </Button>
              <Button size="sm" onClick={openAddEmployee}>
                <Plus className="size-4 mr-1" />
                Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, role, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 rounded-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/70 dark:border-zinc-800/70 text-left text-zinc-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Department</th>
                    <th className="pb-3 pr-4">Salary</th>
                    <th className="pb-3 pr-4">Wallet</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Hire Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredEmployees.map((emp) => (
                      <motion.tr
                        key={emp.id}
                        layout
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40"
                      >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-md bg-zinc-200/70 dark:bg-zinc-800/70 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                            {emp.avatar}
                          </span>
                            <span className="text-zinc-900 dark:text-zinc-100">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{emp.role}</td>
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{emp.department}</td>
                      <td className="py-3 pr-4">
                        <span className="text-zinc-900 dark:text-zinc-100">${emp.salary.toLocaleString()}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <CopyWallet value={emp.address} />
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-medium",
                            emp.status === "active"
                              ? "bg-emerald-600/20 text-emerald-400"
                              : "bg-zinc-600/10 text-zinc-500 dark:text-zinc-400"
                          )}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-200">{emp.hireDate}</td>
                      <td className="py-3 text-right">
                        {emp.status === "active" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mr-1"
                              onClick={() => {
                                setTransferEmployeeId(emp.id);
                                setTransferStep("form");
                                setTransferModalOpen(true);
                              }}
                              title="Pay / Transfer"
                            >
                              <Send className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mr-1 text-violet-400 hover:text-violet-300 hover:bg-violet-600/20"
                              onClick={() => navigate(`/dashboard?view=tongo&to=${encodeURIComponent(emp.address)}`)}
                              title="Private Transfer (Tongo)"
                            >
                              <Shield className="size-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-1"
                          onClick={() => openEditEmployee(emp)}
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredEmployees.length === 0 && (
              <p className="py-8 text-center text-slate-500">
                {search.trim()
                  ? "No employees match your search. Try a different term."
                  : "No team members yet. Click Add Employee to add your first."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transfer history (unified) */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" />
              Transfer History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transfers.length === 0 ? (
              <p className="py-6 text-center text-slate-500">
                No transfers yet. Use New Transfer or pay an employee from the table to see history here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Recipient</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Token</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Tx / Wallet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...transfers].reverse().map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-slate-800 hover:bg-slate-800/50"
                      >
                        <td className="py-3 pr-4">
                          {new Date(t.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              t.type === "starkzap" && "bg-amber-600/20 text-amber-400",
                              t.type === "tongo" && "bg-violet-600/20 text-violet-400",
                              t.type === "direct" && "bg-blue-600/20 text-blue-400"
                            )}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{t.to.name}</td>
                        <td className="py-3 pr-4">
                          ${t.amount.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">{t.token}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs",
                              t.status === "completed" && "bg-emerald-600/20 text-emerald-400",
                              t.status === "pending" && "bg-amber-600/20 text-amber-400",
                              t.status === "failed" && "bg-red-600/20 text-red-400"
                            )}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <TxHashDisplay hash={t.txHash} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EmployeeFormSheet
        open={employeeSheetOpen}
        onClose={() => setEmployeeSheetOpen(false)}
        editingEmployee={editingEmployee}
        onSubmit={handleEmployeeFormSubmit}
      />

      <AlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        description={deleteTarget ? <>Remove <strong>{deleteTarget.name}</strong>? This cannot be undone.</> : ""}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Transfer modal */}
      <Modal
        open={transferModalOpen}
        onClose={() => !transferPending && setTransferModalOpen(false)}
        title="New Transfer"
      >
        {transferStep === "form" ? (
          <div className="space-y-4">
            {tongoConfigured && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Company Tongo private key (for private transfers)
                </label>
                <input
                  type="password"
                  value={companyTongoKey}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCompanyTongoKey(v);
                    try {
                      if (v) localStorage.setItem(TONGO_KEY_STORAGE, v);
                      else localStorage.removeItem(TONGO_KEY_STORAGE);
                    } catch {}
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-[var(--radius-button)] text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Paste to enable private (Tongo) transfers"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Employee
              </label>
              <select
                value={transferEmployeeId}
                onChange={(e) => setTransferEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-[var(--radius-button)] text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select active employee</option>
                {activeEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.role}
                    {e.tongoPublicKey ? " (Tongo)" : ""}
                  </option>
                ))}
              </select>
            </div>
            {selectedEmployee && (
              <div className="text-sm text-slate-400 space-y-1">
                <p>
                  Wallet:{" "}
                  <span className="font-mono text-slate-300 break-all">
                    {selectedEmployee.address}
                  </span>
                </p>
                {selectedEmployee.tongoPublicKey && (
                  <p className="flex items-center gap-1 text-brand-400">
                    <Shield className="size-3" />
                    Private transfer (Tongo) available
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-[var(--radius-button)] text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-[var(--radius-button)] text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Memo"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setTransferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!transferFormValid}
                onClick={goToTransferSummary}
              >
                Next: Summary
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-button)] bg-slate-800 p-4 space-y-2 text-sm">
              {canUseTongoTransfer && (
                <p className="flex items-center gap-1 text-brand-400 font-medium">
                  <Shield className="size-4" />
                  Private transfer (Tongo) — amount encrypted on-chain
                </p>
              )}
              <p>
                <span className="text-slate-500">Recipient:</span>{" "}
                {selectedEmployee?.name}
              </p>
              <p>
                <span className="text-slate-500">Wallet:</span>{" "}
                <span className="font-mono text-slate-300 break-all">
                  {selectedEmployee?.address}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Amount:</span>{" "}
                ${Number(transferAmount).toLocaleString()} USD
              </p>
              {transferNote.trim() && (
                <p>
                  <span className="text-slate-500">Note:</span> {transferNote}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setTransferStep("form")}
                disabled={transferPending}
              >
                Back
              </Button>
              <Button
                onClick={() => confirmTransfer()}
                disabled={transferPending}
              >
                {transferPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Confirm Transfer"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
