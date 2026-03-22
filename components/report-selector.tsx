"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ReportSelectorProps {
  clients: { id: string; name: string }[];
}

export function ReportSelector({ clients }: ReportSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentClient = searchParams.get("client") || "";

  const handleClientChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("client", value);
      } else {
        params.delete("client");
      }
      router.push(`/reports?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Generate report for:</label>
      <select
        value={currentClient}
        onChange={(e) => handleClientChange(e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-white"
      >
        <option value="">All Clients</option>
        {clients.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => window.print()}
        className="ml-auto px-4 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        Export PDF
      </button>
    </div>
  );
}
