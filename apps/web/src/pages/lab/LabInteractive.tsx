import * as React from "react"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { Surface } from "@/components/ui/foundation/Surface"

import { Button } from '@/components/ui/interactive/Button'
import { IconButton } from '@/components/ui/interactive/IconButton'
import { Link } from '@/components/ui/interactive/Link'
import { Input } from '@/components/ui/interactive/Input'
import { Textarea } from '@/components/ui/interactive/Textarea'
import { Badge } from '@/components/ui/interactive/Badge'
import { Checkbox } from '@/components/ui/interactive/Checkbox'
import { Switch } from '@/components/ui/interactive/Switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/interactive/Radio'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/interactive/Select'

export default function LabInteractive() {
  return (
    <Container size="standard" className="py-12 lg:py-24">
      <Stack direction="col" gap="section">
        <Section spacing="none">
          <Stack direction="col" gap="sm" className="mb-12">
            <Heading size="display-md">Interactive Primitives</Heading>
            <Text variant="secondary">Layer B components composing Foundation blocks.</Text>
          </Stack>
          <Divider className="mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Buttons */}
            <Surface elevation="level1" className="p-6 lg:p-8">
              <Heading size="h3" className="mb-6">Buttons</Heading>
              <Stack direction="col" gap="md">
                <Stack direction="row" gap="sm" wrap>
                  <Button intent="primary">Primary</Button>
                  <Button intent="secondary">Secondary</Button>
                  <Button intent="outline">Outline</Button>
                  <Button intent="ghost">Ghost</Button>
                </Stack>
                <Stack direction="row" gap="sm" wrap>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large Button</Button>
                  <IconButton icon={<span className="text-xl">+</span>} />
                </Stack>
              </Stack>
            </Surface>

            {/* Links & Badges */}
            <Surface elevation="level1" className="p-6 lg:p-8">
              <Heading size="h3" className="mb-6">Links & Badges</Heading>
              <Stack direction="col" gap="lg">
                <Stack direction="row" gap="md" wrap>
                  <Link href="#" color="primary">Primary Link</Link>
                  <Link href="#" color="copper">Copper Link</Link>
                  <Link href="#" color="secondary" underline="always">Always Underline</Link>
                </Stack>
                <Stack direction="row" gap="sm" wrap>
                  <Badge tone="neutral">Neutral</Badge>
                  <Badge tone="brand">Brand</Badge>
                  <Badge tone="success">Success</Badge>
                  <Badge tone="warning">Warning</Badge>
                  <Badge tone="critical">Critical</Badge>
                  <Badge tone="outline">Outline</Badge>
                </Stack>
              </Stack>
            </Surface>

            {/* Inputs & Textareas */}
            <Surface elevation="level1" className="p-6 lg:p-8">
              <Heading size="h3" className="mb-6">Text Fields</Heading>
              <Stack direction="col" gap="md">
                <Input placeholder="Default input..." />
                <Input placeholder="Error state..." state="error" />
                <Input placeholder="Success state..." state="success" />
                <Textarea placeholder="Type your message here..." />
              </Stack>
            </Surface>

            {/* Selection Controls */}
            <Surface elevation="level1" className="p-6 lg:p-8">
              <Heading size="h3" className="mb-6">Selection Controls</Heading>
              <Stack direction="col" gap="xl">
                
                <Stack direction="row" gap="md" align="center">
                  <Switch id="airplane" />
                  <label htmlFor="airplane"><Text size="sm">Airplane Mode</Text></label>
                </Stack>

                <Stack direction="row" gap="md" align="center">
                  <Checkbox id="terms" />
                  <label htmlFor="terms"><Text size="sm">Accept terms and conditions</Text></label>
                </Stack>

                <div>
                  <Text size="sm" className="mb-3 block">Radio Group</Text>
                  <RadioGroup defaultValue="comfortable">
                    <Stack direction="row" gap="md" align="center">
                      <RadioGroupItem value="default" id="r1" />
                      <label htmlFor="r1"><Text size="sm">Default</Text></label>
                    </Stack>
                    <Stack direction="row" gap="md" align="center">
                      <RadioGroupItem value="comfortable" id="r2" />
                      <label htmlFor="r2"><Text size="sm">Comfortable</Text></label>
                    </Stack>
                  </RadioGroup>
                </div>

                <div>
                  <Text size="sm" className="mb-3 block">Select Dropdown</Text>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an interior style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern Minimalist</SelectItem>
                      <SelectItem value="classic">Classic Contemporary</SelectItem>
                      <SelectItem value="industrial">Industrial Chic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Stack>
            </Surface>
          </div>
        </Section>
      </Stack>
    </Container>
  )
}
