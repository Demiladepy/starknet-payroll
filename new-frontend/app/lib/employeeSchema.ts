import { z } from "zod";
import { DEPARTMENTS } from "~/lib/seed";

const walletRegex = /^0x[a-fA-F0-9]{40,64}$/;

export const employeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  role: z.string().min(1, "Role is required").trim(),
  department: z.enum([...DEPARTMENTS] as [string, ...string[]], {
    required_error: "Select a department",
  }),
  salary: z.coerce.number().min(0, "Salary must be ≥ 0"),
  address: z.string().regex(walletRegex, "Invalid wallet (0x + 40–64 hex chars)").trim(),
  status: z.enum(["active", "inactive"]),
  hireDate: z.string().min(1, "Hire date is required"),
  tongoPublicKey: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
