"use client";

import { usePayrollStore } from "@/store/payroll-store";
import { formatAddress } from "@/lib/utils";

export function EmployeeRoster() {
  const { employees } = usePayrollStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Employee Roster</h2>
      
      {employees.length === 0 ? (
        <p className="text-gray-500">No employees added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Encrypted Salary (C1)</th>
                <th className="text-left p-2">Encrypted Salary (C2)</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Last Paid</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.address} className="border-b">
                  <td className="p-2 font-mono text-sm">{formatAddress(employee.address)}</td>
                  <td className="p-2 font-mono text-xs break-all">{employee.encryptedSalaryC1.slice(0, 20)}...</td>
                  <td className="p-2 font-mono text-xs break-all">{employee.encryptedSalaryC2.slice(0, 20)}...</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      employee.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {employee.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-2 text-sm">
                    {employee.lastPaid > 0 
                      ? new Date(employee.lastPaid * 1000).toLocaleDateString()
                      : "Never"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
