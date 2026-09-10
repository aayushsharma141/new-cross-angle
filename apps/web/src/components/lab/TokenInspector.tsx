import * as React from "react"
import { X } from "lucide-react"

import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Stack } from "@/components/ui/foundation/Stack"
import { Divider } from "@/components/ui/foundation/Divider"
import { IconButton } from "@/components/ui/interactive/IconButton"
import { Surface } from "@/components/ui/foundation/Surface"

export interface TokenInfo {
  name: string
  tailwind: string
  cssVar: string
  foundation: string
  usage: string
}

interface TokenInspectorProps {
  token: TokenInfo | null
  onClose: () => void
}

export function TokenInspector({ token, onClose }: TokenInspectorProps) {
  if (!token) return null

  const InspectorContent = () => (
    <Stack direction="col" gap="xl">
      <Stack direction="row" justify="between" align="center">
        <Heading size="heading-md">Inspector</Heading>
        <IconButton 
          icon={<X size={20} />} 
          intent="ghost"
          size="icon"
          onClick={onClose}
          className="text-content-secondary hover:text-content-primary"
        />
      </Stack>
      
      <Divider />

      <Stack direction="col" gap="lg">
        <div>
          <Text size="micro" className="mb-1">Semantic Tier</Text>
          <Text size="body" className="font-bold text-copper">{token.name}</Text>
        </div>
        
        <Stack direction="col" gap="sm">
          <Text size="micro" className="opacity-50">↓ Maps to</Text>
          <div>
            <Text size="micro" className="mb-1">CSS Token</Text>
            <Text size="caption" className="font-mono bg-canvas-secondary p-2 rounded">{token.cssVar}</Text>
          </div>
        </Stack>
        
        <Stack direction="col" gap="sm">
          <Text size="micro" className="opacity-50">↓ Maps to</Text>
          <div>
            <Text size="micro" className="mb-1">Foundation Materials</Text>
            <Text size="caption" className="text-content-secondary">{token.foundation}</Text>
          </div>
        </Stack>

        <Stack direction="col" gap="sm">
          <Text size="micro" className="opacity-50">↓ Implemented via</Text>
          <div>
            <Text size="micro" className="mb-1">Tailwind Class</Text>
            <Text size="caption" className="font-mono bg-canvas-secondary p-2 rounded text-copper">{token.tailwind}</Text>
          </div>
        </Stack>

        <Divider />

        <div>
          <Text size="micro" className="mb-1">Design System Rules</Text>
          <Text size="caption" variant="secondary">{token.usage}</Text>
        </div>
      </Stack>
    </Stack>
  )

  return (
    <>
      {/* Desktop Sidebar overlay */}
      <div className="hidden lg:block fixed top-16 bottom-0 right-0 w-80 border-l border-subtle bg-surface-card p-8 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-micro ease-physical">
        <InspectorContent />
      </div>

      {/* Mobile Bottom Sheet overlay */}
      <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-micro">
        <Surface 
          elevation="level2" 
          className="w-full max-h-[90vh] overflow-y-auto rounded-t-xl rounded-b-none p-6 animate-in slide-in-from-bottom duration-micro ease-physical pb-safe"
        >
          <InspectorContent />
        </Surface>
      </div>
    </>
  )
}
