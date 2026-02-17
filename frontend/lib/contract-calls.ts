export interface ContractCall {
  contractAddress: string;
  entrypoint: string;
  calldata: (string | number | bigint)[];
}

const toFelt = (v: string | number | bigint): bigint =>
  typeof v === "bigint" ? v : typeof v === "number" ? BigInt(v) : BigInt(v);

/**
 * Build a PayrollManager add_employee call.
 */
export function addEmployeeCall(
  contractAddress: string,
  employeeAddress: string,
  encryptedSalaryC1: string,
  encryptedSalaryC2: string,
  publicKey: string
): ContractCall {
  return {
    contractAddress,
    entrypoint: "add_employee",
    calldata: [
      toFelt(employeeAddress),
      toFelt(encryptedSalaryC1),
      toFelt(encryptedSalaryC2),
      toFelt(publicKey),
    ],
  };
}

/**
 * Build a PayrollManager execute_payroll call.
 */
export function executePayrollCall(contractAddress: string): ContractCall {
  return {
    contractAddress,
    entrypoint: "execute_payroll",
    calldata: [],
  };
}

/**
 * Build a PayrollManager set_payment_schedule call.
 */
export function setPaymentScheduleCall(
  contractAddress: string,
  frequency: string | number,
  nextPayment: string | number
): ContractCall {
  return {
    contractAddress,
    entrypoint: "set_payment_schedule",
    calldata: [toFelt(frequency), toFelt(nextPayment)],
  };
}

/**
 * Build a ComplianceModule grant_viewing_key call.
 */
export function grantViewingKeyCall(
  contractAddress: string,
  auditorAddress: string,
  viewingKey: string,
  timeRangeStart: number,
  timeRangeEnd: number
): ContractCall {
  return {
    contractAddress,
    entrypoint: "grant_viewing_key",
    calldata: [
      toFelt(auditorAddress),
      toFelt(viewingKey),
      toFelt(timeRangeStart),
      toFelt(timeRangeEnd),
    ],
  };
}

/**
 * Build an EmployeeAccount add_session_key call.
 */
export function addSessionKeyCall(
  contractAddress: string,
  sessionKey: string,
  expiry: string | number
): ContractCall {
  return {
    contractAddress,
    entrypoint: "add_session_key",
    calldata: [toFelt(sessionKey), toFelt(expiry)],
  };
}

/**
 * Build an EmployeeAccount remove_session_key call.
 */
export function removeSessionKeyCall(
  contractAddress: string,
  sessionKey: string
): ContractCall {
  return {
    contractAddress,
    entrypoint: "remove_session_key",
    calldata: [toFelt(sessionKey)],
  };
}
