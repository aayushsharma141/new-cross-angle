import * as React from "react"
import { Navbar } from "@/components/ui/navigation/Navbar"
import { Button } from "@/components/ui/interactive/Button"
import { CaseStudyModel } from "@/types/content/models"

import { HeroPattern } from "@/components/patterns/HeroPattern"
import { StoryPattern } from "@/components/patterns/StoryPattern"
import { GalleryPattern } from "@/components/patterns/GalleryPattern"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"

export interface CaseStudyTemplateProps {
  content: CaseStudyModel
  actions?: Record<string, () => void>
}

/**
 * CaseStudyTemplate (Layer C - Template Library)
 * 
 * Full editorial walkthrough template for single project deep-dives.
 * Consumes strict CaseStudyModel payload from CMS.
 */
export function CaseStudyTemplate({ content, actions }: CaseStudyTemplateProps) {
  return (
    <div className="min-h-screen bg-canvas-primary text-content-primary flex flex-col">
      <Navbar
        variant="glass"
        logo={<span className="font-bold tracking-wider text-copper">CROSSANGLE</span>}
        actions={
          <Button intent="secondary" size="sm" onClick={actions?.navBack}>
            Back to Portfolio
          </Button>
        }
      >
        <a href="/" className="hover:text-copper transition-colors">Home</a>
        <a href="/portfolio" className="hover:text-copper transition-colors">Portfolio</a>
      </Navbar>

      <main className="flex-1">
        <HeroPattern 
          {...content.hero} 
          onPrimaryAction={actions?.heroPrimary} 
          onSecondaryAction={actions?.heroSecondary} 
        />
        
        {content.specs && (
          <div className="py-12 border-b border-subtle bg-canvas-secondary">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <Text size="xs" variant="secondary" className="font-mono mb-1">LOCATION</Text>
                <Heading size="heading-sm">{content.specs.location}</Heading>
              </div>
              <div>
                <Text size="xs" variant="secondary" className="font-mono mb-1">YEAR</Text>
                <Heading size="heading-sm">{content.specs.year}</Heading>
              </div>
              <div>
                <Text size="xs" variant="secondary" className="font-mono mb-1">SIZE</Text>
                <Heading size="heading-sm">{content.specs.size}</Heading>
              </div>
              <div>
                <Text size="xs" variant="secondary" className="font-mono mb-1">CATEGORY</Text>
                <Heading size="heading-sm">{content.specs.category}</Heading>
              </div>
            </div>
          </div>
        )}
        
        <StoryPattern {...content.story} />
        
        <GalleryPattern {...content.gallery} />
        
        {content.nextProjectNav && (
          <div className="py-24 border-t border-subtle bg-stone-950 text-center relative overflow-hidden group cursor-pointer" onClick={actions?.nextProject}>
            {content.nextProjectNav.imageUrl && (
              <img src={content.nextProjectNav.imageUrl} alt="Next Project" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-700" />
            )}
            <div className="relative z-10">
              <Text size="sm" className="font-mono text-copper mb-4 uppercase tracking-widest">NEXT PROJECT</Text>
              <Heading size="display-lg" className="text-white group-hover:text-copper transition-colors">{content.nextProjectNav.title}</Heading>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-subtle py-12 bg-canvas-secondary font-mono text-xs text-content-secondary">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-copper">CROSSANGLE CASE STUDY ARCHITECTURE</span>
          <span>© 2026 CROSSANGLE. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  )
}
