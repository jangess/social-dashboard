"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/app/clients/actions";
import { PLATFORMS, PLATFORM_CONFIG } from "@/lib/platform";
import type { Platform } from "@/lib/types";

interface ProfileRow {
  id: number;
  platform: Platform;
  username: string;
}

let nextId = 1;

function emptyProfile(): ProfileRow {
  return { id: nextId++, platform: "instagram", username: "" };
}

export function AddClientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [profiles, setProfiles] = useState<ProfileRow[]>([emptyProfile()]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function addProfile() {
    setProfiles((prev) => [...prev, emptyProfile()]);
  }

  function removeProfile(id: number) {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }

  function updateProfile(id: number, field: "platform" | "username", value: string) {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  }

  function reset() {
    setName("");
    setCompanyName("");
    setProfiles([emptyProfile()]);
    setError("");
    setIsOpen(false);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("Client name is required");
      return;
    }
    setError("");

    const validProfiles = profiles.filter((p) => p.username.trim());

    startTransition(async () => {
      const result = await createClient({
        name,
        companyName: companyName || undefined,
        profiles: validProfiles.map((p) => ({
          platform: p.platform,
          username: p.username,
        })),
      });

      if (result.success) {
        reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Client
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={reset} />
          <div className="absolute right-0 top-full mt-2 z-50 w-[400px] bg-white border rounded-xl p-4 shadow-lg">
            <h3 className="text-sm font-semibold mb-3">New Client</h3>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-md px-2.5 py-1.5 mb-3">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Client name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full text-sm border rounded-md px-2.5 py-1.5 bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Company name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Optional"
                  className="w-full text-sm border rounded-md px-2.5 py-1.5 bg-background"
                />
              </div>
            </div>

            {/* Social profiles */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Social Profiles
              </label>
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex gap-2 items-center">
                    <select
                      value={profile.platform}
                      onChange={(e) =>
                        updateProfile(profile.id, "platform", e.target.value)
                      }
                      className="text-sm border rounded-md px-2 py-1.5 bg-background w-32"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {PLATFORM_CONFIG[p].label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        updateProfile(profile.id, "username", e.target.value)
                      }
                      placeholder="username"
                      className="flex-1 text-sm border rounded-md px-2.5 py-1.5 bg-background"
                    />
                    {profiles.length > 1 && (
                      <button
                        onClick={() => removeProfile(profile.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addProfile}
                className="text-xs text-primary hover:underline mt-1.5"
              >
                + Add another profile
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={reset}
                disabled={isPending}
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Creating…" : "Create Client"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
