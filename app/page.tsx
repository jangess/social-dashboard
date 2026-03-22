import { Suspense } from "react";
import { getDashboardFeed, getClients, getOverviewStats } from "@/lib/queries";
import { FilterBar } from "@/components/filter-bar";
import { KpiCard } from "@/components/kpi-card";
import { EngagementChart } from "@/components/engagement-chart";
import { TopPosts } from "@/components/top-posts";
import { PlatformBreakdown } from "@/components/platform-breakdown";
import { ClientSummary } from "@/components/client-summary";
import { formatNumber, formatEngagement, buildFilters } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ client?: string; platform?: string; from?: string; to?: string }>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = buildFilters(params);

  const [feed, clients] = await Promise.all([
    getDashboardFeed(filters),
    getClients(),
  ]);

  const stats = await getOverviewStats(feed);

  return (
    <>
      <Suspense fallback={null}>
        <FilterBar clients={clients} />
      </Suspense>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard
            title="Total Posts"
            value={formatNumber(stats.totalPosts)}
            subtitle={`across ${stats.activeClients} client${stats.activeClients !== 1 ? "s" : ""}`}
          />
          <KpiCard
            title="Avg Engagement Rate"
            value={formatEngagement(stats.avgEngagement)}
            subtitle="(likes + comments) / followers"
          />
          <KpiCard
            title="Total Interactions"
            value={formatNumber(stats.totalInteractions)}
            subtitle="likes + comments + shares"
          />
          <KpiCard
            title="Active Profiles"
            value={stats.activeProfiles.toString()}
            subtitle={`across ${stats.activeClients} client${stats.activeClients !== 1 ? "s" : ""}`}
          />
        </div>

        {/* Chart + Top Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-6">
          <div className="lg:col-span-3">
            <EngagementChart data={feed} from={filters.from} to={filters.to} />
          </div>
          <div className="lg:col-span-2">
            <TopPosts posts={feed} />
          </div>
        </div>

        {/* Platform Breakdown + Client Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <PlatformBreakdown data={feed} />
          <ClientSummary data={feed} />
        </div>
      </main>
    </>
  );
}
