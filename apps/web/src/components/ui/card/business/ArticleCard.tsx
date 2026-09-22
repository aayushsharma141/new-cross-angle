import * as React from "react"
import { Card } from "../base/Card"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { cn } from "@/lib/utils"
import { getOptimizedUrl } from "@/lib/cdn"

export interface ArticleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  snippet: string
  date: string
  readTime: string
  category: string
  imageUrl?: string
  onClick?: () => void
}

export function ArticleCard({
  title,
  snippet,
  date,
  readTime,
  category,
  imageUrl,
  onClick,
  className,
  ...props
}: ArticleCardProps) {
  return (
    <Card interactive onClick={onClick} className={cn("overflow-hidden group border border-subtle flex flex-col justify-between bg-surface-card", className)} {...props}>
      <div>
        <div className="w-full aspect-video bg-stone-900 relative overflow-hidden flex items-center justify-center text-stone-600 font-mono text-xs">
          {imageUrl ? (
            <img
              src={getOptimizedUrl(imageUrl, { width: 800, quality: 80 })}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span>[ Article Image ]</span>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 text-xs font-mono text-copper mb-2">
            <span>{category}</span>
            <span>·</span>
            <span className="text-content-secondary">{readTime}</span>
          </div>

          <Heading size="heading-md" className="group-hover:text-copper transition-colors mb-2">
            {title}
          </Heading>

          <Text size="caption" variant="secondary" className="line-clamp-2">
            {snippet}
          </Text>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0">
        <Text size="caption" variant="secondary" className="font-mono">
          {date}
        </Text>
      </div>
    </Card>
  )
}
