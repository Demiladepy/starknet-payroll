import { WalletConnect } from "@/components/wallet/WalletConnect";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee Portal</h1>
        <WalletConnect />
      </nav>
      {children}
    </div>
  );
}
