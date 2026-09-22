import * as React from "react"
import { Card } from "../base/Card"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { cn } from "@/lib/utils"
import { getOptimizedUrl } from "@/lib/cdn"

export interface GalleryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  imageUrl?: string
  onClick?: () => void
}

export function GalleryCard({
  title,
  subtitle,
  imageUrl,
  onClick,
  className,
  ...props
}: GalleryCardProps) {
  return (
    <Card interactive onClick={onClick} className={cn("overflow-hidden group border border-stone-800 bg-stone-950 text-stone-100 relative aspect-square", className)} {...props}>
      {imageUrl ? (
        <img
          src={getOptimizedUrl(imageUrl, { width: 480, quality: 80 })}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-stone-900 to-stone-950 flex items-center justify-center font-mono text-xs text-stone-700">
          [ High-Contrast Architectural Render ]
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent p-6 flex flex-col justify-end transition-opacity duration-300">
        <Heading size="heading-md" className="text-stone-100 group-hover:text-copper transition-colors">
          {title}
        </Heading>
        {subtitle && (
          <Text size="caption" className="text-stone-400 font-mono mt-1">
            {subtitle}
          </Text>
        )}
      </div>
    </Card>
  )
}
