/**
 * ComplianceModule contract ABI. Regenerate from compiled contract if available.
 */
export const ComplianceModuleABI = [
  {
    type: "function",
    name: "grant_viewing_key",
    inputs: [
      { name: "auditor_address", type: "core::starknet::contract_address::ContractAddress" },
      { name: "viewing_key", type: "core::felt252" },
      {
        name: "scope",
        type: "struct",
        members: [
          { name: "time_range_start", type: "core::integer::u64" },
          { name: "time_range_end", type: "core::integer::u64" },
        ],
      },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "revoke_viewing_key",
    inputs: [{ name: "auditor_address", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "get_viewing_key",
    inputs: [{ name: "auditor_address", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [
      {
        type: "struct",
        name: "ViewingKeyData",
        members: [
          { name: "viewing_key", type: "core::felt252" },
          {
            name: "scope",
            type: "struct",
            members: [
              { name: "time_range_start", type: "core::integer::u64" },
              { name: "time_range_end", type: "core::integer::u64" },
            ],
          },
          { name: "granted_at", type: "core::integer::u64" },
          { name: "expires_at", type: "core::integer::u64" },
        ],
      },
    ],
    state_mutability: "view",
  },
] as const;
