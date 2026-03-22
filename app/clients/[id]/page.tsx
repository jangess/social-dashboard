import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getClientById,
  getProfilesByClient,
  getDashboardFeed,
  getOverviewStats,
} from "@/lib/queries";
import { KpiCard } from "@/components/kpi-card";
import { PostTable } from "@/components/post-table";
import { PlatformBadge } from "@/components/platform-badge";
import { formatNumber, formatEngagement, formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const [profiles, feed] = await Promise.all([
    getProfilesByClient(id),
    getDashboardFeed({ client: client.name }, 500),
  ]);

  const stats = await getOverviewStats(feed);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Clients
        </Link>
        <h1 className="text-lg font-semibold">{client.name}</h1>
        {client.company_name && (
          <p className="text-sm text-muted-foreground">{client.company_name}</p>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          title="Total Posts"
          value={formatNumber(stats.totalPosts)}
        />
        <KpiCard
          title="Avg Engagement"
          value={formatEngagement(stats.avgEngagement)}
          subtitle="(likes + comments) / followers"
        />
        <KpiCard
          title="Total Interactions"
          value={formatNumber(stats.totalInteractions)}
        />
        <KpiCard
          title="Profiles"
          value={stats.activeProfiles.toString()}
        />
      </div>

      {/* Profiles */}
      <h2 className="text-sm font-semibold mb-3">Social Profiles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <PlatformBadge platform={profile.platform} />
              <span className="text-sm font-medium">{profile.username}</span>
            </div>
            {profile.display_name && (
              <p className="text-xs text-muted-foreground mb-1">
                {profile.display_name}
              </p>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              {profile.followers_count != null && (
                <span>{formatNumber(profile.followers_count)} followers</span>
              )}
              {profile.last_scraped_at && (
                <span>
                  Last scraped {formatRelativeDate(profile.last_scraped_at)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Posts */}
      <h2 className="text-sm font-semibold mb-3">Posts</h2>
      <PostTable posts={feed} showClient={false} />
    </main>
  );
}
