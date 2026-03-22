import { PLATFORM_CONFIG } from "@/lib/platform";
import type { Platform } from "@/lib/types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const config = PLATFORM_CONFIG[platform];
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
