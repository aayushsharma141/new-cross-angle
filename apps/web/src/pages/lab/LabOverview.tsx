import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Stack } from "@/components/ui/foundation/Stack"
import { Container } from "@/components/ui/foundation/Container"

export default function LabOverview() {
  return (
    <Container size="standard" className="py-12 lg:py-24">
      <Stack direction="col" gap="lg" className="max-w-3xl">
        <Heading size="display-lg">Design System Lab</Heading>
        <Text size="body" variant="secondary" className="text-lg">
          The central hub for all design tokens, components, and patterns used across the application. 
          Every piece of UI originates here, ensuring consistency, accessibility, and high performance.
        </Text>
        
        <div className="mt-8">
          <Heading size="h3" className="mb-4">How to use this lab</Heading>
          <ul className="list-disc pl-5 space-y-2 text-content-secondary">
            <li><strong className="text-content-primary">Foundations:</strong> Core tokens like typography, color, spacing, and motion.</li>
            <li><strong className="text-content-primary">Interactive:</strong> Base interactive elements like Buttons, Inputs, and Badges.</li>
            <li><strong className="text-content-primary">Inspector:</strong> Click on tokens to see how they map to CSS variables and Tailwind classes.</li>
          </ul>
        </div>
      </Stack>
    </Container>
  )
}
