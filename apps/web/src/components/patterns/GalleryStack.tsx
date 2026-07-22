import React from 'react';
import { Container, Stack, Grid, Surface, Text } from '../primitives/foundation';

export const patternMeta = {
  genomeIds: ["P001", "P002", "P004", "P005", "P007"],
  intents: ["Gallery", "Showcase", "Media"],
  reusable: true,
};

export interface GalleryStackProps {
  title: string;
  description?: string;
  items: React.ReactNode[];
}

export function GalleryStack({ title, description, items }: GalleryStackProps) {
  return (
    <Container size="lg" className="py-16">
      <Stack gap="xl">
        <Stack gap="sm" align="center">
          <Text variant="h3">{title}</Text>
          {description && <Text variant="body" color="muted">{description}</Text>}
        </Stack>
        <Grid cols={3} gap="lg">
          {items.map((item, i) => (
            <Surface key={i} variant="muted" radius="md" className="aspect-[4/3] w-full overflow-hidden">
              {item}
            </Surface>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
