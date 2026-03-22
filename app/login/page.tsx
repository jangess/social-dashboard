"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold">Social Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter password to continue
          </p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-foreground text-background rounded-lg py-2 text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
