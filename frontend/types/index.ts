export interface Employee {
  address: string;
  alias?: string;
  encryptedSalaryC1: string;
  encryptedSalaryC2: string;
  publicKey: string;
  active: boolean;
  lastPaid: number;
}

export interface PaymentSchedule {
  frequency: number; // seconds
  nextPayment: number; // timestamp
}

export interface ViewingKeyData {
  viewingKey: string;
  scope: {
    employeeAddresses: string[];
    timeRangeStart: number;
    timeRangeEnd: number;
  };
  grantedAt: number;
  expiresAt: number;
}

export interface SessionKey {
  key: string;
  expiry: number;
  permissions: {
    allowedContracts: string[];
    allowedFunctions: string[];
  };
}
