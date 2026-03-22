"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { DashboardFeedItem } from "@/lib/types";

interface EngagementChartProps {
  data: DashboardFeedItem[];
}

const METRICS = [
  { key: "likes", label: "Likes", color: "#E1306C", defaultOn: true },
  { key: "comments", label: "Comments", color: "#1877F2", defaultOn: true },
  { key: "shares", label: "Shares", color: "#0A66C2", defaultOn: true },
  { key: "saves", label: "Saves", color: "#10b981", defaultOn: false },
  { key: "views", label: "Views", color: "#8b5cf6", defaultOn: false },
  { key: "engagement", label: "Eng. Rate", color: "#f59e0b", defaultOn: true },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

interface WeekData {
  week: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  engagement: number;
  posts: number;
}

function groupByWeek(items: DashboardFeedItem[]): WeekData[] {
  const weeks: Record<
    string,
    {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      views: number;
      engTotal: number;
      count: number;
    }
  > = {};

  for (const item of items) {
    const date = new Date(item.posted_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split("T")[0];

    if (!weeks[key]) {
      weeks[key] = {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0,
        engTotal: 0,
        count: 0,
      };
    }
    const w = weeks[key];
    w.likes += item.likes || 0;
    w.comments += item.comments || 0;
    w.shares += item.shares || 0;
    w.saves += item.saves || 0;
    w.views += item.views || 0;
    w.engTotal += item.engagement_rate || 0;
    w.count += 1;
  }

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, d]) => ({
      week: new Date(week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      likes: d.likes,
      comments: d.comments,
      shares: d.shares,
      saves: d.saves,
      views: d.views,
      engagement: Number((d.engTotal / d.count).toFixed(2)),
      posts: d.count,
    }));
}

export function EngagementChart({ data }: EngagementChartProps) {
  const chartData = groupByWeek(data);
  const [active, setActive] = useState<Set<MetricKey>>(
    () => new Set(METRICS.filter((m) => m.defaultOn).map((m) => m.key))
  );

  const toggle = (key: MetricKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-4 h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  const volumeMetrics = METRICS.filter(
    (m) => m.key !== "engagement" && active.has(m.key)
  );
  const showEngRate = active.has("engagement");

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Engagement Over Time</h3>
      </div>

      {/* Metric toggles */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => toggle(m.key)}
            className={`px-2 py-0.5 rounded-full text-xs transition-colors flex items-center gap-1 ${
              active.has(m.key)
                ? "font-medium"
                : "opacity-40 hover:opacity-70"
            }`}
            style={{
              backgroundColor: active.has(m.key)
                ? `${m.color}18`
                : "transparent",
              color: m.color,
              border: `1px solid ${active.has(m.key) ? m.color : "#d4d4d4"}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          {/* Left Y-axis: volume */}
          <YAxis
            yAxisId="volume"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
            }
          />
          {/* Right Y-axis: engagement rate % */}
          {showEngRate && (
            <YAxis
              yAxisId="rate"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
          )}
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e5e5e5",
            }}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "engagement") return [`${v}%`, "Eng. Rate"];
              return [v.toLocaleString(), String(name).charAt(0).toUpperCase() + String(name).slice(1)];
            }}
          />
          {/* Stacked areas for volume metrics */}
          {volumeMetrics.map((m, i) => (
            <Area
              key={m.key}
              yAxisId="volume"
              type="monotone"
              dataKey={m.key}
              stackId="volume"
              fill={m.color}
              fillOpacity={0.15}
              stroke={m.color}
              strokeWidth={i === 0 ? 1.5 : 1}
            />
          ))}
          {/* Line overlay for engagement rate */}
          {showEngRate && (
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="engagement"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#f59e0b" }}
              activeDot={{ r: 4 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
