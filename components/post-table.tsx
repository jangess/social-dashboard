"use client";

import { useState } from "react";
import type { DashboardFeedItem } from "@/lib/types";
import { PlatformBadge } from "./platform-badge";
import {
  formatNumber,
  formatEngagement,
  formatRelativeDate,
  formatDate,
  engagementColor,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PostTableProps {
  posts: DashboardFeedItem[];
  showClient?: boolean;
}

type SortKey = "posted_at" | "likes" | "comments" | "engagement_rate";

export function PostTable({ posts, showClient = true }: PostTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("posted_at");
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 50;

  const sorted = [...posts].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    if (sortKey === "posted_at") {
      return sortDesc
        ? new Date(bVal as string).getTime() - new Date(aVal as string).getTime()
        : new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
    }
    return sortDesc
      ? (bVal as number) - (aVal as number)
      : (aVal as number) - (bVal as number);
  });

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    return (
      <button
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {label}
        {sortKey === field && (
          <span className="text-[10px]">{sortDesc ? "↓" : "↑"}</span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-xs text-muted-foreground">
                Post
              </th>
              {showClient && (
                <th className="text-left p-3 font-medium text-xs text-muted-foreground">
                  Client
                </th>
              )}
              <th className="text-left p-3 font-medium text-xs text-muted-foreground">
                Platform
              </th>
              <th className="text-left p-3 font-medium text-xs text-muted-foreground">
                Type
              </th>
              <th className="text-left p-3">
                <SortHeader label="Posted" field="posted_at" />
              </th>
              <th className="text-right p-3">
                <SortHeader label="Likes" field="likes" />
              </th>
              <th className="text-right p-3">
                <SortHeader label="Comments" field="comments" />
              </th>
              <th className="text-right p-3">
                <SortHeader label="Engagement" field="engagement_rate" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((post) => (
              <>
                <tr
                  key={post.post_id}
                  onClick={() =>
                    setExpandedId(
                      expandedId === post.post_id ? null : post.post_id
                    )
                  }
                  className="border-b hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <td className="p-3 max-w-[300px]">
                    <p className="text-xs truncate">
                      {post.post_content?.slice(0, 80) || "No caption"}
                    </p>
                  </td>
                  {showClient && (
                    <td className="p-3 text-xs text-muted-foreground">
                      {post.client_name}
                    </td>
                  )}
                  <td className="p-3">
                    <PlatformBadge platform={post.platform} />
                  </td>
                  <td className="p-3">
                    {post.post_type && (
                      <Badge variant="secondary" className="text-[10px]">
                        {post.post_type}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(post.posted_at)}
                  </td>
                  <td className="p-3 text-xs text-right tabular-nums">
                    {formatNumber(post.likes || 0)}
                  </td>
                  <td className="p-3 text-xs text-right tabular-nums">
                    {formatNumber(post.comments || 0)}
                  </td>
                  <td
                    className={`p-3 text-xs text-right font-medium tabular-nums ${engagementColor(
                      post.engagement_rate
                    )}`}
                  >
                    {formatEngagement(post.engagement_rate)}
                  </td>
                </tr>
                {expandedId === post.post_id && (
                  <tr key={`${post.post_id}-expanded`} className="border-b bg-muted/10">
                    <td colSpan={showClient ? 8 : 7} className="p-4">
                      <div className="text-xs space-y-2 max-w-2xl">
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {post.post_content || "No content"}
                        </p>
                        <div className="flex gap-4 text-muted-foreground pt-1">
                          <span>Views: {formatNumber(post.views || 0)}</span>
                          <span>Shares: {formatNumber(post.shares || 0)}</span>
                          <span>Saves: {formatNumber(post.saves || 0)}</span>
                        </div>
                        {post.post_url && (
                          <a
                            href={post.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-block mt-1"
                          >
                            View original post →
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={showClient ? 8 : 7}
                  className="p-8 text-center text-muted-foreground text-sm"
                >
                  No posts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)}{" "}
            of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-2 py-1 rounded hover:bg-muted disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded hover:bg-muted disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
