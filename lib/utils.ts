import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

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
