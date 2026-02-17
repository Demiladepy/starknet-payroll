/**
 * EmployeeAccount contract ABI (for session keys). Regenerate from compiled contract if available.
 */
export const EmployeeAccountABI = [
  {
    type: "function",
    name: "add_session_key",
    inputs: [
      { name: "session_key", type: "core::felt252" },
      { name: "expiry", type: "core::integer::u64" },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "remove_session_key",
    inputs: [{ name: "session_key", type: "core::felt252" }],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "get_encrypted_balance",
    inputs: [],
    outputs: [
      { type: "core::felt252" },
      { type: "core::felt252" },
    ],
    state_mutability: "view",
  },
] as const;
