import { Suspense } from "react";
import { getDashboardFeed, getClients, getOverviewStats } from "@/lib/queries";
import { KpiCard } from "@/components/kpi-card";
import { PlatformBreakdown } from "@/components/platform-breakdown";
import { TopPosts } from "@/components/top-posts";
import { EngagementChart } from "@/components/engagement-chart";
import { ReportSelector } from "@/components/report-selector";
import { formatNumber, formatEngagement, formatDate, buildFilters } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ client?: string; platform?: string; from?: string; to?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = buildFilters(params);

  const [clients, feed] = await Promise.all([
    getClients(),
    getDashboardFeed(filters, 500),
  ]);

  const stats = await getOverviewStats(feed);
  const selectedClient = clients.find((c) => c.name === params.client);
  const reportTitle = selectedClient ? selectedClient.name : "All Clients";

  return (
    <>
      <Suspense fallback={null}>
        <div className="border-b bg-white print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <ReportSelector clients={clients} />
          </div>
        </div>
      </Suspense>

      {/* Report content - print-friendly */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Report Header */}
        <div className="mb-8 print:mb-6">
          <h1 className="text-2xl font-bold">{reportTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Social Media Performance Report &bull; Generated{" "}
            {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <KpiCard
            title="Total Posts"
            value={formatNumber(stats.totalPosts)}
          />
          <KpiCard
            title="Avg Engagement"
            value={formatEngagement(stats.avgEngagement)}
          />
          <KpiCard
            title="Interactions"
            value={formatNumber(stats.totalInteractions)}
          />
          <KpiCard
            title="Active Profiles"
            value={stats.activeProfiles.toString()}
          />
        </div>

        {/* Engagement Chart */}
        <div className="mb-8">
          <EngagementChart data={feed} />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
          <TopPosts posts={feed} limit={10} />
          <PlatformBreakdown data={feed} />
        </div>
      </main>
    </>
  );
}
