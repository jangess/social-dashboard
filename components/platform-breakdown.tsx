import type { DashboardFeedItem, Platform } from "@/lib/types";
import { PLATFORM_CONFIG } from "@/lib/platform";
import { formatEngagement } from "@/lib/utils";

interface PlatformBreakdownProps {
  data: DashboardFeedItem[];
}

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
  const byPlatform: Record<string, { total: number; count: number }> = {};

  for (const item of data) {
    if (!byPlatform[item.platform]) {
      byPlatform[item.platform] = { total: 0, count: 0 };
    }
    byPlatform[item.platform].total += item.engagement_rate || 0;
    byPlatform[item.platform].count += 1;
  }

  const platforms = Object.entries(byPlatform)
    .map(([platform, { total, count }]) => ({
      platform: platform as Platform,
      avg: total / count,
      count,
    }))
    .sort((a, b) => b.avg - a.avg);

  const maxAvg = Math.max(...platforms.map((p) => p.avg), 1);

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Platform Breakdown</h3>
      <div className="flex flex-col gap-3">
        {platforms.map(({ platform, avg, count }) => {
          const config = PLATFORM_CONFIG[platform];
          return (
            <div key={platform}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                  <span className="text-muted-foreground">({count} posts)</span>
                </span>
                <div className="text-right">
                  <span className="font-medium">{formatEngagement(avg)}</span>
                  <p className="text-[10px] text-muted-foreground">avg. engagement</p>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(avg / maxAvg) * 100}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
        {platforms.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No platform data
          </p>
        )}
      </div>
    </div>
  );
}
