import Link from "next/link";
import type { DashboardFeedItem } from "@/lib/types";
import { formatEngagement } from "@/lib/utils";

interface ClientSummaryProps {
  data: DashboardFeedItem[];
}

export function ClientSummary({ data }: ClientSummaryProps) {
  const byClient: Record<
    string,
    { id: string; name: string; profiles: Set<string>; posts: number; totalEng: number }
  > = {};

  for (const item of data) {
    if (!byClient[item.client_id]) {
      byClient[item.client_id] = {
        id: item.client_id,
        name: item.client_name,
        profiles: new Set(),
        posts: 0,
        totalEng: 0,
      };
    }
    byClient[item.client_id].profiles.add(`${item.platform}-${item.username}`);
    byClient[item.client_id].posts += 1;
    byClient[item.client_id].totalEng += item.engagement_rate || 0;
  }

  const clients = Object.values(byClient)
    .map((c) => ({
      ...c,
      profileCount: c.profiles.size,
      avgEngagement: c.posts > 0 ? c.totalEng / c.posts : 0,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Client Summary</h3>
      <div className="flex flex-col gap-2">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div>
              <p className="text-xs font-semibold">{client.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {client.profileCount} profile{client.profileCount !== 1 ? "s" : ""} &bull;{" "}
                {client.posts} post{client.posts !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">
                {formatEngagement(client.avgEngagement)}
              </p>
              <p className="text-[10px] text-muted-foreground">avg. engagement</p>
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No client data
          </p>
        )}
      </div>
    </div>
  );
}
