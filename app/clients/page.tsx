import Link from "next/link";
import { getClients, getDashboardFeed } from "@/lib/queries";
import { PlatformBadge } from "@/components/platform-badge";
import { AddClientForm } from "@/components/add-client-form";
import { formatEngagement } from "@/lib/utils";
import type { Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, feed] = await Promise.all([
    getClients(),
    getDashboardFeed(undefined, 1000),
  ]);

  // Aggregate stats per client
  const clientStats: Record<
    string,
    {
      platforms: Set<Platform>;
      posts: number;
      totalEng: number;
      latestPost: string | null;
    }
  > = {};

  for (const item of feed) {
    if (!clientStats[item.client_id]) {
      clientStats[item.client_id] = {
        platforms: new Set(),
        posts: 0,
        totalEng: 0,
        latestPost: null,
      };
    }
    const s = clientStats[item.client_id];
    s.platforms.add(item.platform);
    s.posts += 1;
    s.totalEng += item.engagement_rate || 0;
    if (!s.latestPost || item.posted_at > s.latestPost) {
      s.latestPost = item.posted_at;
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Clients</h1>
        <AddClientForm />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clients.map((client) => {
          const stats = clientStats[client.id];
          const avgEng = stats && stats.posts > 0 ? stats.totalEng / stats.posts : 0;
          return (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white border rounded-xl p-4 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-sm">{client.name}</h2>
                  {client.company_name && (
                    <p className="text-xs text-muted-foreground">
                      {client.company_name}
                    </p>
                  )}
                </div>
                <p className="text-lg font-bold">{formatEngagement(avgEng)}</p>
              </div>
              {stats ? (
                <>
                  <div className="flex gap-1.5 mb-2">
                    {Array.from(stats.platforms).map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.posts} post{stats.posts !== 1 ? "s" : ""} &bull;{" "}
                    {stats.platforms.size} platform
                    {stats.platforms.size !== 1 ? "s" : ""}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No data yet</p>
              )}
            </Link>
          );
        })}
        {clients.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No clients found
          </p>
        )}
      </div>
    </main>
  );
}
