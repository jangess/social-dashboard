import type { DashboardFeedItem } from "@/lib/types";
import { PlatformBadge } from "./platform-badge";
import { formatEngagement, engagementColor } from "@/lib/utils";

interface TopPostsProps {
  posts: DashboardFeedItem[];
  limit?: number;
}

export function TopPosts({ posts, limit = 5 }: TopPostsProps) {
  const sorted = [...posts]
    .filter((p) => p.engagement_rate != null)
    .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
    .slice(0, limit);

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Top Performing Posts</h3>
      <div className="flex flex-col divide-y">
        {sorted.map((post) => (
          <div
            key={post.post_id}
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="w-10 h-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
              {post.post_url && (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {post.post_content?.slice(0, 60) || "No caption"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {post.client_name}
                </span>
                <PlatformBadge platform={post.platform} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold ${engagementColor(post.engagement_rate)}`}>
                {formatEngagement(post.engagement_rate)}
              </p>
              <p className="text-[10px] text-muted-foreground">eng. rate</p>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No posts yet
          </p>
        )}
      </div>
    </div>
  );
}
