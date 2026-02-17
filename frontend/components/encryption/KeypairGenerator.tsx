"use client";

import { useState } from "react";
import { tongoService } from "@/lib/tongo";
import { Button } from "@/components/ui/button";

export function KeypairGenerator() {
  const [keypair, setKeypair] = useState<{ privateKey: string; publicKey: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newKeypair = await tongoService.generateKeypair();
      setKeypair(newKeypair);
    } catch (error) {
      console.error("Keypair generation error:", error);
      alert("Failed to generate keypair");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Generate ElGamal Keypair</h3>
      
      <div className="space-y-4">
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Keypair"}
        </Button>

        {keypair && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm font-medium mb-2">Public Key:</p>
              <p className="text-xs font-mono break-all">{keypair.publicKey}</p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900 rounded">
              <p className="text-sm font-medium mb-2">Private Key (keep secret):</p>
              <p className="text-xs font-mono break-all">{keypair.privateKey}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
