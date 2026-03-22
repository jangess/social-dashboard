export type Platform = "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube";

export interface Client {
  id: string;
  name: string;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialProfile {
  id: string;
  client_id: string;
  platform: Platform;
  username: string;
  display_name: string | null;
  profile_url: string;
  avatar_url: string | null;
  followers_count: number | null;
  is_active: boolean;
  last_scraped_at: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string; company_name: string | null };
}

export interface Post {
  id: string;
  social_profile_id: string;
  platform_post_id: string;
  post_type: string | null;
  content: string | null;
  permalink: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  hashtags: string[] | null;
  posted_at: string;
  platform_data: Record<string, unknown>;
  created_at: string;
}

export interface PostMetrics {
  id: string;
  post_id: string;
  scraped_at: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  saves: number;
  engagement_rate: number | null;
  extra_metrics: Record<string, unknown>;
}

export interface DashboardFeedItem {
  client_id: string;
  client_name: string;
  company_name: string | null;
  platform: Platform;
  username: string;
  profile_url: string;
  followers_count: number | null;
  post_id: string;
  post_type: string | null;
  post_content: string | null;
  post_url: string | null;
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  saves: number;
  engagement_rate: number | null;
  metrics_updated_at: string | null;
}

export interface Filters {
  client?: string;
  platform?: Platform;
  from?: string;
  to?: string;
  postType?: string;
}
