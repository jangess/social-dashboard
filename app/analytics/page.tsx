import { Suspense } from "react";
import { getDashboardFeed, getClients } from "@/lib/queries";
import { FilterBar } from "@/components/filter-bar";
import { EngagementChart } from "@/components/engagement-chart";
import { PlatformBreakdown } from "@/components/platform-breakdown";
import { ContentTypeChart } from "@/components/content-type-chart";
import { PostingHeatmap } from "@/components/posting-heatmap";
import { buildFilters } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ client?: string; platform?: string; from?: string; to?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = buildFilters(params);

  const [feed, clients] = await Promise.all([
    getDashboardFeed(filters, 500),
    getClients(),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <FilterBar clients={clients} />
      </Suspense>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <h1 className="text-lg font-semibold mb-4">Analytics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
          <EngagementChart data={feed} from={filters.from} to={filters.to} />
          <PlatformBreakdown data={feed} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ContentTypeChart data={feed} />
          <PostingHeatmap data={feed} />
        </div>
      </main>
    </>
  );
}
