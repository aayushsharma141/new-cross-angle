import * as React from "react"
import { Navbar } from "@/components/ui/navigation/Navbar"
import { Button } from "@/components/ui/interactive/Button"
import { PortfolioModel } from "@/types/content/models"

import { HeroPattern } from "@/components/patterns/HeroPattern"
import { GalleryPattern } from "@/components/patterns/GalleryPattern"
import { CTAPattern } from "@/components/patterns/CTAPattern"

export interface PortfolioTemplateProps {
  content: PortfolioModel
  actions?: Record<string, () => void>
}

/**
 * PortfolioTemplate (Layer C - Template Library)
 * 
 * Data-driven layout shell for portfolio showcases and filterable interior galleries.
 * Consumes strict PortfolioModel payload from CMS.
 */
export function PortfolioTemplate({ content, actions }: PortfolioTemplateProps) {
  return (
    <div className="min-h-screen bg-canvas-primary text-content-primary flex flex-col">
      <Navbar
        variant="glass"
        logo={<span className="font-bold tracking-wider text-copper">CROSSANGLE</span>}
        actions={
          <Button intent="primary" size="sm" onClick={actions?.navInquire}>
            Inquire Project
          </Button>
        }
      >
        <a href="/" className="hover:text-copper transition-colors">Home</a>
        <a href="/portfolio" className="text-copper font-semibold">Portfolio</a>
        <a href="/services" className="hover:text-copper transition-colors">Services</a>
      </Navbar>

      <main className="flex-1">
        <HeroPattern 
          {...content.hero} 
          onPrimaryAction={actions?.heroPrimary} 
          onSecondaryAction={actions?.heroSecondary} 
        />
        
        {/* Filters will go here (interactive component) */}
        
        <GalleryPattern {...content.gallery} />
        
        {content.cta && (
          <CTAPattern 
            {...content.cta} 
            onAction={actions?.ctaPrimary} 
          />
        )}
      </main>

      <footer className="border-t border-subtle py-12 bg-canvas-secondary font-mono text-xs text-content-secondary">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-copper">CROSSANGLE PORTFOLIO ARCHITECTURE</span>
          <span>© 2026 CROSSANGLE. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  )
}
