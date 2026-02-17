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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Key Management</h2>
      
      <div className="space-y-4">
        {keypair ? (
          <>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm font-medium mb-2">Public Key (share with employer):</p>
              <p className="text-xs font-mono break-all">{keypair.publicKey}</p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900 rounded">
              <p className="text-sm font-medium mb-2">Private Key (keep secret):</p>
              {showPrivateKey ? (
                <p className="text-xs font-mono break-all">{keypair.privateKey}</p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrivateKey(true)}
                >
                  Show Private Key
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExportKeys} variant="outline">
                Export Keys
              </Button>
              <Button
                onClick={handleGenerateKeypair}
                variant="destructive"
              >
                Generate New Keypair
              </Button>
            </div>
          </>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Generate an ElGamal keypair to receive encrypted salary payments.
            </p>
            <Button
              onClick={handleGenerateKeypair}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Keypair"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
