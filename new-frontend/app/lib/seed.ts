export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  address: string;
  status: "active" | "inactive";
  hireDate: string;
  avatar: string;
  /** Tongo public key (hex) for private transfers. Optional. */
  tongoPublicKey?: string;
};

export type Transfer = {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  note: string;
  address: string;
  date: string;
};

export const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Operations",
  "HR",
  "Support",
] as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function seedEmployees(): Employee[] {
  return [
    {
      id: "1",
      name: "Alex Chen",
      role: "Software Engineer",
      department: "Engineering",
      salary: 8500,
      address: "0x0123abcd4567ef89ab0123cdef456789abcdef01",
      status: "active",
      hireDate: "2023-01-15",
      avatar: initials("Alex Chen"),
      tongoPublicKey: undefined,
    },
    {
      id: "2",
      name: "Jordan Smith",
      role: "Marketing Lead",
      department: "Marketing",
      salary: 7200,
      address: "0x1234bcde5678fa90bc1234def567890bcdef012",
      status: "active",
      hireDate: "2022-06-01",
      avatar: initials("Jordan Smith"),
      tongoPublicKey: undefined,
    },
    {
      id: "3",
      name: "Sam Williams",
      role: "Operations Coordinator",
      department: "Operations",
      salary: 5800,
      address: "0x2345cdef6789gb01cd2345ef678901cdef01234",
      status: "inactive",
      hireDate: "2021-11-20",
      avatar: initials("Sam Williams"),
      tongoPublicKey: undefined,
    },
  ];
}
