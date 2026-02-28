import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sheet } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { employeeFormSchema, type EmployeeFormValues } from "~/lib/employeeSchema";
import { DEPARTMENTS } from "~/lib/seed";
import type { Employee } from "~/lib/seed";

interface EmployeeFormSheetProps {
  open: boolean;
  onClose: () => void;
  editingEmployee: Employee | null;
  onSubmit: (values: EmployeeFormValues, isEdit: boolean, existingId?: string) => void;
}

const defaultValues: EmployeeFormValues = {
  name: "",
  role: "",
  department: "Engineering",
  salary: 0,
  address: "",
  status: "active",
  hireDate: new Date().toISOString().slice(0, 10),
  tongoPublicKey: "",
};

export function EmployeeFormSheet({
  open,
  onClose,
  editingEmployee,
  onSubmit,
}: EmployeeFormSheetProps) {
  const isEdit = !!editingEmployee;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && editingEmployee) {
      reset({
        name: editingEmployee.name,
        role: editingEmployee.role,
        department: editingEmployee.department,
        salary: editingEmployee.salary,
        address: editingEmployee.address,
        status: editingEmployee.status,
        hireDate: editingEmployee.hireDate.slice(0, 10),
        tongoPublicKey: editingEmployee.tongoPublicKey ?? "",
      });
    } else {
      reset(defaultValues);
    }
  }, [open, isEdit, editingEmployee, reset]);

  function onFormSubmit(values: EmployeeFormValues) {
    onSubmit(values, isEdit, editingEmployee?.id);
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Employee" : "Add Employee"}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Full name"
            className="mt-1 dark:bg-zinc-800 dark:border-zinc-700"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="role" className="text-zinc-700 dark:text-zinc-300">Role</Label>
          <Input
            id="role"
            {...register("role")}
            placeholder="e.g. Software Engineer"
            className="mt-1 dark:bg-zinc-800 dark:border-zinc-700"
          />
          {errors.role && (
            <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="department" className="text-zinc-700 dark:text-zinc-300">Department</Label>
          <select
            id="department"
            {...register("department")}
            className="mt-1 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.department && (
            <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="salary" className="text-zinc-700 dark:text-zinc-300">Monthly Salary (USD)</Label>
          <Input
            id="salary"
            type="number"
            min={0}
            {...register("salary")}
            className="mt-1 dark:bg-zinc-800 dark:border-zinc-700"
          />
          {errors.salary && (
            <p className="mt-1 text-xs text-red-500">{errors.salary.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="address" className="text-zinc-700 dark:text-zinc-300">Wallet Address</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="0x..."
            className="mt-1 font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="tongoPublicKey" className="text-zinc-700 dark:text-zinc-300">Tongo public key (optional)</Label>
          <Input
            id="tongoPublicKey"
            {...register("tongoPublicKey")}
            placeholder="0x... (for private transfers)"
            className="mt-1 font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700"
          />
        </div>
        <div>
          <Label htmlFor="status" className="text-zinc-700 dark:text-zinc-300">Status</Label>
          <select
            id="status"
            {...register("status")}
            className="mt-1 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <Label htmlFor="hireDate" className="text-zinc-700 dark:text-zinc-300">Hire Date</Label>
          <Input
            id="hireDate"
            type="date"
            {...register("hireDate")}
            className="mt-1 dark:bg-zinc-800 dark:border-zinc-700"
          />
          {errors.hireDate && (
            <p className="mt-1 text-xs text-red-500">{errors.hireDate.message}</p>
          )}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isEdit ? "Update" : "Add"} Employee
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
