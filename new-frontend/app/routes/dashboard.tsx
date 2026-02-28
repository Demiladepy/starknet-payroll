import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Modal } from "~/components/ui/modal";
import { AlertDialog } from "~/components/ui/alert-dialog";
import { CopyWallet } from "~/components/ui/copy-wallet";
import { EmployeeFormSheet } from "~/components/dashboard/EmployeeFormSheet";
import { DashboardProvider, useDashboard } from "~/contexts/DashboardContext";
import { useToast } from "~/contexts/ToastContext";
import { Sidebar } from "~/components/dashboard/Sidebar";
import { Topbar } from "~/components/dashboard/Topbar";
import { CommandPalette } from "~/components/dashboard/CommandPalette";
import { Overview } from "~/components/dashboard/Overview";
import { type Employee, type Transfer } from "~/lib/seed";
import type { EmployeeFormValues } from "~/lib/employeeSchema";
import { isTongoConfigured, buildTransferCall } from "~/lib/tongo";
import { cn } from "~/lib/utils";
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

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}

function DashboardLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get("view") || "overview";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const tongoConfigured = isTongoConfigured();

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

  const walletSection = (
    <>
      {tongoConfigured && (
        <span className="text-xs text-zinc-500">Tongo</span>
      )}
      {!isConnected ? (
        <Button
          size="sm"
          onClick={() => connectors[0] && connect({ connector: connectors[0] })}
          disabled={connectors.length === 0}
        >
          <Wallet className="size-4 mr-1" />
          Connect
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 truncate max-w-[100px]">
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </span>
          <Button variant="ghost" size="icon" onClick={() => disconnect()}>
            <LogOut className="size-4" />
          </Button>
        </div>
      )}
      <Link to="/">
        <Button variant="ghost" size="sm">Home</Button>
      </Link>
    </>
  );

  return (
    <>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
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
          />
          <main className="flex-1 p-6 overflow-auto">
            {view === "overview" && <Overview />}
            {view === "settings" && (
              <div className="page-title">Settings</div>
            )}
            {(view === "employees" || view === "transfers") && (
              <DashboardContent />
            )}
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

function DashboardContent() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { account, isConnected } = useAccount();
  const {
    employees,
    transfers,
    addEmployee,
    updateEmployee,
    removeEmployee,
    addTransfer,
  } = useDashboard();
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

  const canUseTongoTransfer =
    tongoConfigured &&
    isConnected &&
    !!account &&
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

    if (canUseTongoTransfer && account) {
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
        await account.execute({
          contractAddress: call.contractAddress as `0x${string}`,
          entrypoint: call.entrypoint,
          calldata: call.calldata,
        });
        addTransfer({
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          amount,
          note: transferNote.trim(),
          address: selectedEmployee.address,
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

    addTransfer({
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      amount,
      note: transferNote.trim(),
      address: selectedEmployee.address,
    });
    toast("Transfer sent.");
    setTransferModalOpen(false);
  }

  return (
    <>
    <div className="max-w-6xl mx-auto space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[var(--radius-button)] bg-brand-600/20 text-brand-400">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[var(--radius-button)] bg-emerald-600/20 text-emerald-400">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Active Employees</p>
                  <p className="text-2xl font-bold">{activeEmployees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[var(--radius-button)] bg-amber-600/20 text-amber-400">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Monthly Payroll</p>
                  <p className="text-2xl font-bold">
                    ${totalPayroll.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[var(--radius-button)] bg-violet-600/20 text-violet-400">
                  <Send className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Transferred</p>
                  <p className="text-2xl font-bold">
                    ${totalTransferred.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees section */}
        <Card className="bg-slate-900 border-slate-800 mb-8">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, role, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-[var(--radius-button)] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-slate-400">
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
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-[var(--radius-button)] bg-slate-700 text-xs font-medium">
                            {emp.avatar}
                          </span>
                          {emp.name}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{emp.role}</td>
                      <td className="py-3 pr-4">{emp.department}</td>
                      <td className="py-3 pr-4">
                        ${emp.salary.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <CopyWallet value={emp.address} />
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-[var(--radius-button)] text-xs font-medium",
                            emp.status === "active"
                              ? "bg-emerald-600/20 text-emerald-400"
                              : "bg-slate-600/50 text-slate-400"
                          )}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{emp.hireDate}</td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-1"
                          onClick={() => openEditEmployee(emp)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                          onClick={() => setDeleteTarget(emp)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEmployees.length === 0 && (
              <p className="py-8 text-center text-slate-500">
                {search.trim()
                  ? "No employees match your search."
                  : "No employees yet. Add one to get started."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transfer history */}
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
                No transfers yet. Use &quot;New Transfer&quot; to send a payment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Recipient</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Note</th>
                      <th className="pb-3">Wallet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...transfers].reverse().map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-slate-800 hover:bg-slate-800/50"
                      >
                        <td className="py-3 pr-4">
                          {new Date(t.date).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">{t.employeeName}</td>
                        <td className="py-3 pr-4">
                          ${t.amount.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">{t.note || "—"}</td>
                        <td className="py-3">
                          <CopyWallet value={t.address} />
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
