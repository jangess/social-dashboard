import { Suspense } from "react";
import { getDashboardFeed, getClients } from "@/lib/queries";
import { FilterBar } from "@/components/filter-bar";
import { PostTable } from "@/components/post-table";
import type { Filters, Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ client?: string; platform?: string; from?: string; to?: string }>;
}

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: Filters = {
    client: params.client || undefined,
    platform: (params.platform as Platform) || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
  };

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Content Feed</h1>
          <p className="text-sm text-muted-foreground">
            {feed.length} post{feed.length !== 1 ? "s" : ""}
          </p>
        </div>
        <PostTable posts={feed} />
      </main>
    </>
  );
}
