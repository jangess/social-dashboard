import { supabase } from "./supabase";
import type { Client, DashboardFeedItem, Filters, SocialProfile } from "./types";

export async function getDashboardFeed(filters?: Filters, limit = 200): Promise<DashboardFeedItem[]> {
  let query = supabase.from("dashboard_feed").select("*");

  if (filters?.client) {
    query = query.ilike("client_name", `%${filters.client}%`);
  }
  if (filters?.platform) {
    query = query.eq("platform", filters.platform);
  }
  if (filters?.from) {
    query = query.gte("posted_at", filters.from);
  }
  if (filters?.to) {
    query = query.lte("posted_at", `${filters.to}T23:59:59`);
  }
  if (filters?.postType) {
    query = query.eq("post_type", filters.postType);
  }

  const { data, error } = await query.order("posted_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getProfilesByClient(clientId: string): Promise<SocialProfile[]> {
  const { data, error } = await supabase
    .from("social_profiles")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("platform");
  if (error) throw error;
  return data ?? [];
}

export async function getMetricsTimeSeries(postId: string) {
  const { data, error } = await supabase
    .from("post_metrics")
    .select("scraped_at, likes, comments, shares, views, saves, engagement_rate")
    .eq("post_id", postId)
    .order("scraped_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOverviewStats(feed: DashboardFeedItem[]) {
  const totalPosts = feed.length;
  const totalInteractions = feed.reduce(
    (sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
    0
  );
  const avgEngagement =
    feed.length > 0
      ? feed.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / feed.length
      : 0;

  const profiles = new Set(feed.map((p) => `${p.platform}-${p.username}`));
  const clients = new Set(feed.map((p) => p.client_id));

  return {
    totalPosts,
    totalInteractions,
    avgEngagement,
    activeProfiles: profiles.size,
    activeClients: clients.size,
  };
}
