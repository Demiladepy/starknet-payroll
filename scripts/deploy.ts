#!/usr/bin/env node
/**
 * Deployment script for Privacy Payroll contracts.
 *
 * Prerequisites:
 *   1. Compile contracts: cd contracts && scarb build
 *   2. If Scarb does not output Sierra JSON, use Starkli to build and deploy:
 *      starkli build && starkli deploy ...
 *
 * Usage:
 *   NETWORK=sepolia PRIVATE_KEY=0x... ACCOUNT_ADDRESS=0x... npx ts-node scripts/deploy.ts
 *   Optional: USDC_TOKEN_ADDRESS=0x... TONGO_WRAPPER_ADDRESS=0x...
 *
 * The script deploys ComplianceModule(payroll_manager=0, owner) first, then
 * PayrollManager(owner, usdc_token, tongo_wrapper, compliance_module_address),
 * and writes addresses to frontend/.env.local.
 */

import { RpcProvider, Account } from "starknet";
import * as fs from "fs";
import * as path from "path";

const NETWORK = process.env.NETWORK || "sepolia";
const RPC_URL =
  process.env.RPC_URL ||
  (NETWORK === "sepolia"
    ? "https://starknet-sepolia.public.blastapi.io"
    : "https://starknet-mainnet.public.blastapi.io");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS || "";

const ARTIFACTS_DIR =
  process.env.ARTIFACTS_DIR ||
  path.join(process.cwd(), "contracts", "target", "release");

function artifactPathFrom(dir: string, contractName: string): string {
  const base = contractName.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  return path.join(dir, `privacy_payroll_${base}.contract_class.json`);
}

function findArtifactPath(contractName: string): string {
  const candidates = [
    ARTIFACTS_DIR,
    path.join(process.cwd(), "contracts", "target", "dev"),
    path.join(process.cwd(), "contracts", "target", "release"),
  ];

  for (const dir of candidates) {
    const p = artifactPathFrom(dir, contractName);
    if (fs.existsSync(p)) return p;
  }

  // fall back to the default path (for error message)
  return artifactPathFrom(ARTIFACTS_DIR, contractName);
}

async function deploy(): Promise<void> {
  if (!PRIVATE_KEY || !ACCOUNT_ADDRESS) {
    console.error("Set PRIVATE_KEY and ACCOUNT_ADDRESS");
    process.exit(1);
  }

  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  const account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);

  const usdcToken = process.env.USDC_TOKEN_ADDRESS || "0x0";
  const tongoWrapper = process.env.TONGO_WRAPPER_ADDRESS || "0x0";

  let complianceModuleAddress: string;
  let payrollManagerAddress: string;
  let employeeAccountAddress: string;

  const compliancePath = findArtifactPath("ComplianceModule");
  const payrollPath = findArtifactPath("PayrollManager");
  const employeeAccountPath = findArtifactPath("EmployeeAccount");

  if (
    !fs.existsSync(compliancePath) ||
    !fs.existsSync(payrollPath) ||
    !fs.existsSync(employeeAccountPath)
  ) {
    console.log("Compiled artifacts not found at:");
    console.log("  ", compliancePath);
    console.log("  ", payrollPath);
    console.log("  ", employeeAccountPath);
    console.log("\nTo deploy:");
    console.log("  1. cd contracts && scarb build");
    console.log("  2. If your Scarb config outputs to a different path, set ARTIFACTS_DIR or copy Sierra JSON to the paths above.");
    console.log("  3. Alternatively use Starkli: starkli build && starkli deploy ...");
    console.log("\nWriting placeholder .env.local with empty addresses so the app runs without on-chain contracts.");
    const envContent = `
NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS=
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=
NEXT_PUBLIC_EMPLOYEE_ACCOUNT_ADDRESS=
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=${usdcToken}
NEXT_PUBLIC_TONGO_WRAPPER_ADDRESS=${tongoWrapper}
`.trim();
    const outPath = path.join(process.cwd(), "frontend", ".env.local");
    fs.writeFileSync(outPath, envContent);
    console.log("Wrote", outPath);
    return;
  }

  try {
    console.log("Deploying ComplianceModule...");
    const complianceClass = JSON.parse(fs.readFileSync(compliancePath, "utf-8"));
    const complianceDeclare = await account.declare({
      contract: complianceClass,
      classHash: undefined,
    });
    await provider.waitForTransaction(complianceDeclare.transaction_hash);
    const complianceClassHash = complianceDeclare.class_hash;

    const complianceDeploy = await account.deployContract({
      classHash: complianceClassHash,
      constructorCalldata: ["0x0", ACCOUNT_ADDRESS],
    });
    await provider.waitForTransaction(complianceDeploy.transaction_hash);
    complianceModuleAddress = complianceDeploy.contract_address;
    console.log("  ComplianceModule:", complianceModuleAddress);

    console.log("Deploying PayrollManager...");
    const payrollClass = JSON.parse(fs.readFileSync(payrollPath, "utf-8"));
    const payrollDeclare = await account.declare({
      contract: payrollClass,
      classHash: undefined,
    });
    await provider.waitForTransaction(payrollDeclare.transaction_hash);
    const payrollClassHash = payrollDeclare.class_hash;

    const payrollDeploy = await account.deployContract({
      classHash: payrollClassHash,
      constructorCalldata: [
        ACCOUNT_ADDRESS,
        usdcToken,
        tongoWrapper,
        complianceModuleAddress,
      ],
    });
    await provider.waitForTransaction(payrollDeploy.transaction_hash);
    payrollManagerAddress = payrollDeploy.contract_address;
    console.log("  PayrollManager:", payrollManagerAddress);

    console.log("Deploying EmployeeAccount (demo instance)...");
    const employeeAccountClass = JSON.parse(fs.readFileSync(employeeAccountPath, "utf-8"));
    const employeeAccountDeclare = await account.declare({
      contract: employeeAccountClass,
      classHash: undefined,
    });
    await provider.waitForTransaction(employeeAccountDeclare.transaction_hash);
    const employeeAccountClassHash = employeeAccountDeclare.class_hash;
    const employeeAccountDeploy = await account.deployContract({
      classHash: employeeAccountClassHash,
      constructorCalldata: [payrollManagerAddress],
    });
    await provider.waitForTransaction(employeeAccountDeploy.transaction_hash);
    employeeAccountAddress = employeeAccountDeploy.contract_address;
    console.log("  EmployeeAccount:", employeeAccountAddress);
  } catch (err) {
    console.error("Deploy failed:", err);
    process.exit(1);
  }

  const envContent = `
NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS=${payrollManagerAddress}
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=${complianceModuleAddress}
NEXT_PUBLIC_EMPLOYEE_ACCOUNT_ADDRESS=${employeeAccountAddress}
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=${usdcToken}
NEXT_PUBLIC_TONGO_WRAPPER_ADDRESS=${tongoWrapper}
`.trim();

  const outPath = path.join(process.cwd(), "frontend", ".env.local");
  fs.writeFileSync(outPath, envContent);
  console.log("\nWrote", outPath);
}

deploy().catch(console.error);
