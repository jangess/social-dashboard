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
  from?: string; // yyyy-MM-dd
  to?: string;   // yyyy-MM-dd
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

interface BucketData {
  label: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  engagement: number;
  posts: number;
}

/** Parse "yyyy-MM-dd" as local midnight (not UTC). */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format date as "yyyy-MM-dd" using local time. */
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function defaultDateRange(): { from: string; to: string } {
  const now = new Date();
  const to = toDateKey(now);
  const sevenAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  return { from: toDateKey(sevenAgo), to };
}

function groupByTimeBucket(items: DashboardFeedItem[], from?: string, to?: string): BucketData[] {
  // Always use concrete date boundaries (never derive from data timestamps)
  const defaults = defaultDateRange();
  const resolvedFrom = from || defaults.from;
  const resolvedTo = to || defaults.to;

  const rangeStart = parseLocalDate(resolvedFrom);
  const rangeEnd = parseLocalDate(resolvedTo);

  const spanDays = Math.round(
    (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const useDaily = spanDays <= 30;

  // Aggregate items into buckets keyed by local date
  const buckets: Record<
    string,
    { likes: number; comments: number; shares: number; saves: number; views: number; engTotal: number; count: number }
  > = {};

  for (const item of items) {
    const date = new Date(item.posted_at);
    let key: string;
    if (useDaily) {
      key = toDateKey(date);
    } else {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = toDateKey(weekStart);
    }

    if (!buckets[key]) {
      buckets[key] = { likes: 0, comments: 0, shares: 0, saves: 0, views: 0, engTotal: 0, count: 0 };
    }
    const b = buckets[key];
    b.likes += item.likes || 0;
    b.comments += item.comments || 0;
    b.shares += item.shares || 0;
    b.saves += item.saves || 0;
    b.views += item.views || 0;
    b.engTotal += item.engagement_rate || 0;
    b.count += 1;
  }

  // Fill every day/week in range for a continuous x-axis
  const allKeys: string[] = [];
  const cursor = new Date(rangeStart);
  if (useDaily) {
    while (cursor <= rangeEnd) {
      allKeys.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    cursor.setDate(cursor.getDate() - cursor.getDay());
    while (cursor <= rangeEnd) {
      allKeys.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
  }

  const empty = { likes: 0, comments: 0, shares: 0, saves: 0, views: 0, engTotal: 0, count: 0 };
  return allKeys.map((key) => {
    const d = buckets[key] || empty;
    return {
      label: parseLocalDate(key).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      likes: d.likes,
      comments: d.comments,
      shares: d.shares,
      saves: d.saves,
      views: d.views,
      engagement: d.count > 0 ? Number((d.engTotal / d.count).toFixed(2)) : 0,
      posts: d.count,
    };
  });
}

export function EngagementChart({ data, from, to }: EngagementChartProps) {
  const chartData = groupByTimeBucket(data, from, to);

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
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
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
              dot={{ r: 1.5, fill: m.color, strokeWidth: 0 }}
              isAnimationActive={false}
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
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
