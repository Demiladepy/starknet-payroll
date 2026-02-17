# Privacy Payroll Smart Contracts

Cairo 2.x smart contracts for the Privacy-First Payroll System.

## Contracts

### PayrollManager

Core payroll management contract.

**Functions:**
- `add_employee`: Add employee with encrypted salary
- `execute_payroll`: Execute batch payments
- `update_salary`: Update employee salary
- `remove_employee`: Deactivate employee
- `set_payment_schedule`: Configure payment frequency

### EmployeeAccount

Account abstraction contract for employees.

**Functions:**
- `claim_salary`: Claim salary payment
- `add_session_key`: Add session key for automated payments
- `remove_session_key`: Revoke session key
- `__validate__`: Account validation (returns paymaster)

### ComplianceModule

Viewing key management for audits.

**Functions:**
- `grant_viewing_key`: Grant auditor access to specific salaries
- `revoke_viewing_key`: Revoke auditor access

## Building

```bash
scarb build
```

## Testing

```bash
scarb test
```

## Deployment

See `../scripts/deploy.ts` for deployment script.
