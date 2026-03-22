"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DashboardFeedItem } from "@/lib/types";

interface ContentTypeChartProps {
  data: DashboardFeedItem[];
}

export function ContentTypeChart({ data }: ContentTypeChartProps) {
  const byType: Record<string, { total: number; count: number }> = {};

  for (const item of data) {
    const type = item.post_type || "unknown";
    if (!byType[type]) byType[type] = { total: 0, count: 0 };
    byType[type].total += item.engagement_rate || 0;
    byType[type].count += 1;
  }

  const chartData = Object.entries(byType)
    .map(([type, { total, count }]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      avgEngagement: Number((total / count).toFixed(2)),
      posts: count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  if (chartData.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-4 h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Content Type Performance</h3>
        <span className="text-xs text-muted-foreground">
          Avg engagement by post type
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Avg Engagement"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }}
          />
          <Bar dataKey="avgEngagement" fill="var(--primary)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
