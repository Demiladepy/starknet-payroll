/**
 * Client-only: uses useConnect, useAccount, useStarkzap.
 * Loaded dynamically from home.tsx so it never runs during SSR (avoids "useStarkzap must be used within StarkzapProvider").
 */

import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { useConnect, useAccount } from "@starknet-react/core";
import { useStarkzap } from "~/contexts/StarkzapContext";
import { LayoutDashboard, Zap, Wallet } from "lucide-react";

export function HomeHeroCTAs() {
  const navigate = useNavigate();
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { wallet: starkzapWallet, connecting: starkzapConnecting, connectStarkzap } = useStarkzap();

  const connected = status === "connected" && !!address;
  const starkzapConnected = !!starkzapWallet?.address;

  async function handleStarkzap() {
    try {
      await connectStarkzap();
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
    }
  }

  if (connected || starkzapConnected) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link to="/dashboard">
          <Button size="lg" className="min-w-[180px] btn-fintech-primary">
            <LayoutDashboard className="size-5 mr-2" />
            Open Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          size="lg"
          variant="outline"
          className="min-w-[180px] border-[var(--accent-teal)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10"
          onClick={() => connect({ connector })}
        >
          <Wallet className="size-5 mr-2" />
          Connect {connector.name}
        </Button>
      ))}
      <Button
        size="lg"
        className="min-w-[180px] btn-fintech-primary"
        onClick={handleStarkzap}
        disabled={starkzapConnecting}
      >
        {starkzapConnecting ? (
          "Connecting…"
        ) : (
          <>
            <Zap className="size-5 mr-2" />
            Sign in with Starkzap
          </>
        )}
      </Button>
    </div>
  );
}
