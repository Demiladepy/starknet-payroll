"use client";

import { useState, useEffect } from "react";
import { tongoService } from "@/lib/tongo";
import { Button } from "@/components/ui/button";

export function KeyManagement() {
  const [keypair, setKeypair] = useState<{ privateKey: string; publicKey: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    // Load existing keypair from storage
    const storedPrivateKey = localStorage.getItem("elgamal_private_key");
    const storedPublicKey = localStorage.getItem("elgamal_public_key");
    
    if (storedPrivateKey && storedPublicKey) {
      setKeypair({
        privateKey: storedPrivateKey,
        publicKey: storedPublicKey,
      });
    }
  }, []);

  const handleGenerateKeypair = async () => {
    setIsGenerating(true);
    try {
      const newKeypair = await tongoService.generateKeypair();
      
      // Store securely (in production, use encrypted storage)
      localStorage.setItem("elgamal_private_key", newKeypair.privateKey);
      localStorage.setItem("elgamal_public_key", newKeypair.publicKey);
      
      setKeypair(newKeypair);
    } catch (error) {
      console.error("Keypair generation error:", error);
      alert("Failed to generate keypair");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportKeys = () => {
    if (!keypair) return;
    
    const data = JSON.stringify(keypair, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "elgamal-keys.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Key management</h2>
      
      <div className="space-y-4">
        {keypair ? (
          <>
            <div className="p-4 rounded-xl bg-[var(--section)] border border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">Public key (share with employer)</p>
              <p className="text-xs font-mono break-all text-[var(--muted)]">{keypair.publicKey}</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--section)]">
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">Private key (keep secret)</p>
              {showPrivateKey ? (
                <p className="text-xs font-mono break-all text-[var(--muted)]">{keypair.privateKey}</p>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowPrivateKey(true)} className="rounded-xl">
                  Show private key
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExportKeys} variant="outline" className="rounded-xl">Export keys</Button>
              <Button onClick={handleGenerateKeypair} variant="destructive" className="rounded-xl">Generate new keypair</Button>
            </div>
          </>
        ) : (
          <div>
            <p className="text-[var(--muted)] text-sm mb-4">
              Generate an ElGamal keypair to receive encrypted salary payments.
            </p>
            <Button
              onClick={handleGenerateKeypair}
              disabled={isGenerating}
              className="w-full rounded-xl"
            >
              {isGenerating ? "Generating…" : "Generate keypair"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
