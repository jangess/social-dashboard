import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, subDays } from "date-fns";
import type { Filters, Platform } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatEngagement(rate: number | null): string {
  if (rate == null) return "—";
  return `${rate.toFixed(2)}%`;
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function engagementColor(rate: number | null): string {
  if (rate == null) return "text-muted-foreground";
  if (rate >= 3) return "text-green-600";
  if (rate >= 1.5) return "text-yellow-600";
  return "text-red-500";
}

export function trendIndicator(current: number, previous: number): { label: string; positive: boolean } {
  if (previous === 0) return { label: "—", positive: true };
  const pct = ((current - previous) / previous) * 100;
  return {
    label: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
    positive: pct >= 0,
  };
}

/** Build filters from search params, defaulting to last 7 days when no date is set. */
export function buildFilters(params: { client?: string; platform?: string; from?: string; to?: string }): Filters {
  const today = format(new Date(), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  return {
    client: params.client || undefined,
    platform: (params.platform as Platform) || undefined,
    from: params.from || sevenDaysAgo,
    to: params.to || today,
  };
}
