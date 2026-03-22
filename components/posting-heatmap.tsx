"use client";

import type { DashboardFeedItem } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface PostingHeatmapProps {
  data: DashboardFeedItem[];
}

export function PostingHeatmap({ data }: PostingHeatmapProps) {
  const grid: number[][] = Array.from({ length: 7 }, () =>
    Array(24).fill(0)
  );

  for (const item of data) {
    const date = new Date(item.posted_at);
    grid[date.getDay()][date.getHours()] += 1;
  }

  const maxCount = Math.max(...grid.flat(), 1);

  function cellColor(count: number) {
    if (count === 0) return "bg-muted/30";
    const intensity = count / maxCount;
    if (intensity > 0.7) return "bg-primary";
    if (intensity > 0.4) return "bg-primary/60";
    if (intensity > 0.1) return "bg-primary/30";
    return "bg-primary/15";
  }

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Best Posting Times</h3>
        <span className="text-xs text-muted-foreground">
          Posts by day &times; hour
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Hour labels */}
          <div className="flex gap-[2px] mb-1 ml-10">
            {HOURS.filter((_, i) => i % 3 === 0).map((h) => (
              <span
                key={h}
                className="text-[9px] text-muted-foreground"
                style={{ width: `${(3 / 24) * 100}%` }}
              >
                {h.toString().padStart(2, "0")}
              </span>
            ))}
          </div>
          {/* Grid */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-[2px] mb-[2px]">
              <span className="text-[10px] text-muted-foreground w-8 text-right mr-1">
                {day}
              </span>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={`flex-1 h-4 rounded-sm ${cellColor(grid[dayIdx][hour])}`}
                  title={`${day} ${hour}:00 — ${grid[dayIdx][hour]} posts`}
                />
              ))}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-10 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/15" />
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
