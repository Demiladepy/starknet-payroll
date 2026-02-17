/**
 * PayrollManager contract ABI (felt252 types). Regenerate from compiled contract if available.
 */
export const PayrollManagerABI = [
  {
    type: "function",
    name: "add_employee",
    inputs: [
      { name: "employee_address", type: "core::starknet::contract_address::ContractAddress" },
      { name: "encrypted_salary_c1", type: "core::felt252" },
      { name: "encrypted_salary_c2", type: "core::felt252" },
      { name: "public_key", type: "core::felt252" },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "execute_payroll",
    inputs: [],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "update_salary",
    inputs: [
      { name: "employee_address", type: "core::starknet::contract_address::ContractAddress" },
      { name: "encrypted_salary_c1", type: "core::felt252" },
      { name: "encrypted_salary_c2", type: "core::felt252" },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "remove_employee",
    inputs: [{ name: "employee_address", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "set_payment_schedule",
    inputs: [
      { name: "frequency", type: "core::integer::u64" },
      { name: "next_payment", type: "core::integer::u64" },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "get_employee",
    inputs: [{ name: "employee_address", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [
      {
        type: "struct",
        name: "EmployeeData",
        members: [
          { name: "encrypted_salary_c1", type: "core::felt252" },
          { name: "encrypted_salary_c2", type: "core::felt252" },
          { name: "public_key", type: "core::felt252" },
          { name: "active", type: "core::bool" },
          { name: "last_paid", type: "core::integer::u64" },
        ],
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "get_payment_schedule",
    inputs: [],
    outputs: [
      {
        type: "struct",
        name: "PaymentSchedule",
        members: [
          { name: "frequency", type: "core::integer::u64" },
          { name: "next_payment", type: "core::integer::u64" },
        ],
      },
    ],
    state_mutability: "view",
  },
] as const;
