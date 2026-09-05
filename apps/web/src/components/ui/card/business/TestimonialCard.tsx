import * as React from "react"
import { Card } from "../base/Card"
import { Text } from "@/components/ui/foundation/Text"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string
  author: string
  role: string
  rating?: number
  projectScope?: string
}

export function TestimonialCard({
  quote,
  author,
  role,
  rating = 5,
  projectScope,
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <Card className={cn("p-8 border border-subtle flex flex-col justify-between h-full bg-surface-card", className)} {...props}>
      <div>
        <div className="flex items-center gap-1 text-copper mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>
        <Text size="body-lg" family="serif" className="italic text-content-primary mb-6">
          "{quote}"
        </Text>
      </div>

      <div className="pt-4 border-t border-subtle">
        <Text size="sm" className="font-semibold text-content-primary">
          {author}
        </Text>
        <Text size="xs" variant="secondary" className="font-mono">
          {role} {projectScope ? `· ${projectScope}` : ""}
        </Text>
      </div>
    </Card>
  )
}
