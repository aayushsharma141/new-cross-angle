import React from 'react';
import { EditorialHero, EditorialSplit, GalleryStack } from '../components/patterns';
import { Stack, Divider } from '../components/primitives/foundation';

export function MarketingRoom() {
  return (
    <Stack gap="none">
      <EditorialHero 
        title="Design That Scales" 
        subtitle="Built from the genome up to prevent drift and ensure consistency."
        primaryActionLabel="Get Started"
        secondaryActionLabel="Read the Docs"
      />
      <EditorialSplit 
        label="Architecture"
        title="Foundational Primitives"
        description="Every layout is composed of strictly defined primitives, ensuring tokens are never bypassed."
        actionLabel="Explore Primitives"
        imageNode={<div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />}
      />
      <Divider />
      <GalleryStack 
        title="Component Showcase"
        description="A look at what you can build with our patterns."
        items={Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />)}
      />
    </Stack>
  );
}
