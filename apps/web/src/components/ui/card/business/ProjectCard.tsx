import * as React from "react"
import { Card } from "../base/Card"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Badge } from "@/components/ui/interactive/Badge"
import { cn } from "@/lib/utils"
import { getOptimizedUrl } from "@/lib/cdn"

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  category: string
  location: string
  imageUrl?: string
  aspectRatio?: "video" | "square" | "portrait"
  onClick?: () => void
}

export function ProjectCard({
  title,
  category,
  location,
  imageUrl,
  aspectRatio = "video",
  onClick,
  className,
  ...props
}: ProjectCardProps) {
  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  }

  return (
    <Card interactive onClick={onClick} className={cn("overflow-hidden group border border-subtle", className)} {...props}>
      <div className={cn("w-full bg-stone-900 relative overflow-hidden flex items-center justify-center text-stone-600 font-mono text-xs", aspectStyles[aspectRatio])}>
        {imageUrl ? (
          <img
            src={getOptimizedUrl(imageUrl, { width: 800, quality: 80 })}
            alt={title}
            className="w-full h-full object-cover transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span>[ {title} Render ]</span>
        )}
        <div className="absolute top-3 left-3 z-10">
          <Badge tone="brand">{category}</Badge>
        </div>
      </div>

      <div className="p-6 bg-surface-card">
        <Heading size="heading-md" className="group-hover:text-copper transition-colors">
          {title}
        </Heading>
        <Text size="caption" variant="secondary" className="mt-1 font-mono">
          {location}
        </Text>
      </div>
    </Card>
  )
}
