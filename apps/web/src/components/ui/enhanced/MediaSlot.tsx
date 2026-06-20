import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getOptimizedUrl } from "@/lib/cdn";

interface MediaSlotProps {
  assetKey: string;
  className?: string;
  fallbackUrl?: string;
  alt?: string;
  onLoad?: () => void;
}

export function MediaSlot({ assetKey, className, fallbackUrl, alt, onLoad }: MediaSlotProps) {
  const [media, setMedia] = useState<{ url: string; mime_type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        const result = await supabase
          .from("site_media_assets" as never)
          .select("media_files(url, mime_type)")
          .eq("asset_key", assetKey)
          .maybeSingle();
          
        const data = result.data as unknown as { media_files: { url: string; mime_type: string } };
        if (data?.media_files) {
          setMedia(data.media_files);
        }
      } catch (err) {
        console.error(`Error loading media slot for ${assetKey}:`, err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMedia();
  }, [assetKey]);

  if (isLoading) {
    // Show a pulsing skeleton while we check if there's a mapped asset
    return <div className={cn("animate-pulse bg-muted rounded-md", className)} />;
  }

  const url = media?.url || fallbackUrl;
  const isVideo = media?.mime_type?.startsWith("video") || url?.match(/\.(mp4|webm|ogg)$/i);

  if (!url) {
    // If no media mapped and no fallback provided
    return (
      <div className={cn("bg-muted border border-dashed rounded-md flex items-center justify-center text-muted-foreground", className)}>
        No Media Mapped
      </div>
    );
  }

  if (isVideo) {
    const poster = url.includes("ik.imagekit.io")
      // ImageKit transformation: Start Offset (so) 1 grabs the frame at 1 second
      ? getOptimizedUrl(url, { width: 1920, quality: 85 }).replace("/tr:", "/tr:so-1,")
      : undefined;

    return (
      <video
        src={url}
        className={cn("w-full h-full object-cover", className)}
        poster={poster}
        onLoadedData={onLoad}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  return (
    <img
      src={getOptimizedUrl(url, { width: 1920, quality: 100 })}
      alt={alt || assetKey}
      className={cn("w-full h-full object-cover", className)}
      loading="lazy"
      onLoad={onLoad}
    />
  );
}
