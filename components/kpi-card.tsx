import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { label: string; positive: boolean };
}

export function KpiCard({ title, value, subtitle, trend }: KpiCardProps) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {trend && (
        <p
          className={cn(
            "text-xs mt-1",
            trend.positive ? "text-green-600" : "text-red-500"
          )}
        >
          {trend.label} vs prev period
        </p>
      )}
      {subtitle && !trend && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
