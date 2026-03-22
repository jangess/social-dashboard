"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { subDays, format, parseISO } from "date-fns";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORMS, PLATFORM_CONFIG } from "@/lib/platform";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { Platform } from "@/lib/types";

interface FilterBarProps {
  clients: { id: string; name: string }[];
}

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

export function FilterBar({ clients }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentClient = searchParams.get("client") || "";
  const currentPlatform = searchParams.get("platform") || "";
  const defaultFrom = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const defaultTo = format(new Date(), "yyyy-MM-dd");
  const currentFrom = searchParams.get("from") || defaultFrom;
  const currentTo = searchParams.get("to") || defaultTo;

  const [customFrom, setCustomFrom] = useState(currentFrom);
  const [customTo, setCustomTo] = useState(currentTo);
  const [open, setOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setDateRange = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (from) {
        params.set("from", from);
      } else {
        params.delete("from");
      }
      if (to) {
        params.set("to", to);
      } else {
        params.delete("to");
      }
      router.push(`?${params.toString()}`);
      setOpen(false);
    },
    [router, searchParams]
  );

  const clearDateRange = useCallback(() => {
    setCustomFrom("");
    setCustomTo("");
    setDateRange("", "");
  }, [setDateRange]);

  // Derive display label for date range pill
  function dateRangeLabel(): string {
    if (!currentFrom && !currentTo) return "Date range";
    // Check if it matches a preset
    const today = format(new Date(), "yyyy-MM-dd");
    for (const preset of DATE_PRESETS) {
      const presetFrom = format(subDays(new Date(), preset.days), "yyyy-MM-dd");
      if (currentFrom === presetFrom && currentTo === today) {
        return preset.label;
      }
    }
    // Custom range
    if (currentFrom && currentTo) {
      const f = format(parseISO(currentFrom), "MMM d");
      const t = format(parseISO(currentTo), "MMM d");
      return `${f} – ${t}`;
    }
    if (currentFrom) return `From ${format(parseISO(currentFrom), "MMM d")}`;
    if (currentTo) return `Until ${format(parseISO(currentTo), "MMM d")}`;
    return "Date range";
  }

  const hasDateFilter = currentFrom || currentTo;

  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 flex-wrap">
        {/* Client filter */}
        <button
          onClick={() => updateFilter("client", "")}
          className={cn(
            "px-3 py-1 rounded-full text-sm transition-colors",
            !currentClient
              ? "bg-primary text-primary-foreground font-medium"
              : "border border-border text-muted-foreground hover:border-foreground/30"
          )}
        >
          All Clients
        </button>
        {clients.map((c) => (
          <button
            key={c.id}
            onClick={() =>
              updateFilter("client", currentClient === c.name ? "" : c.name)
            }
            className={cn(
              "px-3 py-1 rounded-full text-sm transition-colors",
              currentClient === c.name
                ? "bg-primary text-primary-foreground font-medium"
                : "border border-border text-muted-foreground hover:border-foreground/30"
            )}
          >
            {c.name}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Platform filter */}
        {PLATFORMS.map((p: Platform) => {
          const config = PLATFORM_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() =>
                updateFilter("platform", currentPlatform === p ? "" : p)
              }
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1.5",
                currentPlatform === p
                  ? "bg-primary text-primary-foreground font-medium"
                  : "border border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              {config.label}
            </button>
          );
        })}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Date range filter */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              "px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1.5",
              hasDateFilter
                ? "bg-primary text-primary-foreground font-medium"
                : "border border-border text-muted-foreground hover:border-foreground/30"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            {dateRangeLabel()}
            {hasDateFilter && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateRange();
                }}
                className="ml-0.5 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3">
            <div className="space-y-2">
              {/* Presets */}
              {DATE_PRESETS.map((preset) => {
                const presetFrom = format(
                  subDays(new Date(), preset.days),
                  "yyyy-MM-dd"
                );
                const presetTo = format(new Date(), "yyyy-MM-dd");
                const isActive =
                  currentFrom === presetFrom && currentTo === presetTo;
                return (
                  <button
                    key={preset.days}
                    onClick={() => {
                      setCustomFrom(presetFrom);
                      setCustomTo(presetTo);
                      setDateRange(presetFrom, presetTo);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Custom range
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="flex-1 text-xs border rounded-md px-2 py-1.5 bg-background"
                  />
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="flex-1 text-xs border rounded-md px-2 py-1.5 bg-background"
                  />
                </div>
                <button
                  onClick={() => {
                    if (customFrom || customTo) {
                      setDateRange(customFrom, customTo);
                    }
                  }}
                  disabled={!customFrom && !customTo}
                  className="w-full mt-2 text-xs px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40"
                >
                  Apply
                </button>
              </div>

              {hasDateFilter && (
                <button
                  onClick={clearDateRange}
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-1"
                >
                  Clear dates
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
