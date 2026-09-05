import * as React from "react"
import { Card } from "../base/Card"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Button } from "@/components/ui/interactive/Button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  features?: string[]
  priceRange?: string
  icon?: React.ReactNode
  onSelect?: () => void
}

export function ServiceCard({
  title,
  description,
  features = [],
  priceRange,
  icon,
  onSelect,
  className,
  ...props
}: ServiceCardProps) {
  return (
    <Card className={cn("p-8 border border-subtle flex flex-col justify-between h-full bg-surface-card", className)} {...props}>
      <div>
        {icon && <div className="w-12 h-12 bg-copper/10 text-copper rounded-lg flex items-center justify-center mb-6">{icon}</div>}
        <Heading size="heading-md" className="mb-2">
          {title}
        </Heading>
        <Text size="sm" variant="secondary" className="mb-6">
          {description}
        </Text>

        {features.length > 0 && (
          <ul className="space-y-2 mb-6">
            {features.map((feature, i) => (
              <li key={i} className="text-xs text-content-secondary flex items-center gap-2 font-mono">
                <span className="text-copper">✓</span> {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-6 border-t border-subtle flex items-center justify-between mt-auto">
        {priceRange && (
          <div>
            <Text size="micro" variant="secondary">STARTING FROM</Text>
            <Text size="sm" className="font-semibold font-mono text-copper">{priceRange}</Text>
          </div>
        )}
        <Button intent="ghost" size="sm" onClick={onSelect} className="gap-1 ml-auto">
          Explore Service <ArrowRight size={14} />
        </Button>
      </div>
    </Card>
  )
}
