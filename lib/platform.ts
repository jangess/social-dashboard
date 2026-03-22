import type { Platform } from "./types";

export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bgColor: string; icon: string }> = {
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    bgColor: "bg-gradient-to-br from-purple-600 to-pink-500",
    icon: "IG",
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    bgColor: "bg-blue-600",
    icon: "FB",
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    bgColor: "bg-blue-700",
    icon: "LI",
  },
  tiktok: {
    label: "TikTok",
    color: "#000000",
    bgColor: "bg-black",
    icon: "TT",
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    bgColor: "bg-red-600",
    icon: "YT",
  },
};

export const PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok", "youtube", "linkedin"];
