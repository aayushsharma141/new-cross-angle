import * as React from "react"
import { Navbar } from "@/components/ui/navigation/Navbar"
import { Button } from "@/components/ui/interactive/Button"
import { HomepageModel } from "@/types/content/models"

import { HeroPattern } from "@/components/patterns/HeroPattern"
import { StoryPattern } from "@/components/patterns/StoryPattern"
import { GalleryPattern } from "@/components/patterns/GalleryPattern"
import { ProcessPattern } from "@/components/patterns/ProcessPattern"
import { MetricsPattern } from "@/components/patterns/MetricsPattern"
import { TestimonialPattern } from "@/components/patterns/TestimonialPattern"
import { CTAPattern } from "@/components/patterns/CTAPattern"
import { ContactPattern } from "@/components/patterns/ContactPattern"
import { RevealCurtain } from "@/components/ui/motion/RevealCurtain"

export interface LandingTemplateProps {
  content: HomepageModel
  actions?: Record<string, () => void>
}

/**
 * LandingTemplate (Layer C - Template Library)
 * 
 * Data-driven layout shell for homepages and landing pages.
 * Consumes strict HomepageModel payload from CMS.
 */
export function LandingTemplate({ content, actions }: LandingTemplateProps) {
  return (
    <RevealCurtain>
    <div className="min-h-screen bg-canvas-primary text-content-primary flex flex-col">
      {/* Global Header */}
      <Navbar
        variant="glass"
        logo={<span className="font-bold tracking-wider text-copper">CROSSANGLE</span>}
        actions={
          <Button intent="primary" size="sm" onClick={actions?.navBookConsultation}>
            Book Consultation
          </Button>
        }
      >
        <a href="#story" className="hover:text-copper transition-colors">Philosophy</a>
        <a href="#gallery" className="hover:text-copper transition-colors">Portfolio</a>
        <a href="#process" className="hover:text-copper transition-colors">Process</a>
        <a href="#contact" className="hover:text-copper transition-colors">Contact</a>
      </Navbar>

      {/* Main Pattern Slots */}
      <main className="flex-1">
        <HeroPattern 
          {...content.hero} 
          onPrimaryAction={actions?.heroPrimary} 
          onSecondaryAction={actions?.heroSecondary} 
        />
        
        {/* Design Silence — Bible §7: "Negative space is load-bearing" */}
        <div className="h-[20vh] bg-canvas-primary" aria-hidden="true" />
        
        <div id="story"><StoryPattern {...content.story} /></div>
        
        <div className="h-[20vh] bg-canvas-primary" aria-hidden="true" />
        
        <div id="gallery"><GalleryPattern {...content.gallery} /></div>
        
        {content.process && (
          <>
            <div className="h-[14vh] bg-canvas-primary" aria-hidden="true" />
            <div id="process"><ProcessPattern {...content.process} /></div>
          </>
        )}
        
        {content.metrics && <MetricsPattern {...content.metrics} />}
        
        {content.testimonials && (
          <>
            <div className="h-[14vh] bg-canvas-primary" aria-hidden="true" />
            <TestimonialPattern {...content.testimonials} />
          </>
        )}
        
        {content.cta && (
          <>
            <div className="h-[20vh] bg-canvas-primary" aria-hidden="true" />
            <CTAPattern 
              {...content.cta} 
              onAction={actions?.ctaPrimary} 
            />
          </>
        )}
        
        {content.contact && (
          <>
            <div className="h-[14vh] bg-canvas-primary" aria-hidden="true" />
            <div id="contact"><ContactPattern {...content.contact} /></div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-subtle py-12 bg-canvas-secondary font-mono text-xs text-content-secondary">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-copper">CROSSANGLE INTERIOR ARCHITECTURE</span>
          <span>© 2026 CROSSANGLE. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
    </RevealCurtain>
  )
}
