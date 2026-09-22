import React from 'react';
import { Container, Grid, Stack, Surface, Text } from '../primitives/foundation';
import { Button } from '../primitives/interactive';

export const patternMeta = {
  genomeIds: ["P001", "P002", "P004", "P005", "P007", "P008"],
  intents: ["Editorial", "Split", "Feature"],
  reusable: true,
};

export interface EditorialSplitProps {
  label: string;
  title: string;
  description: string;
  actionLabel?: string;
  imageNode?: React.ReactNode;
}

export function EditorialSplit({ label, title, description, actionLabel, imageNode }: EditorialSplitProps) {
  return (
    <Container size="lg" className="py-16">
      <Grid cols={2} gap="2xl">
        <Stack gap="md" justify="center">
          <Text variant="label" color="accent">{label}</Text>
          <Text variant="h2">{title}</Text>
          <Text variant="body" color="muted">{description}</Text>
          {actionLabel && (
            <div className="mt-4">
              <Button variant="outline">{actionLabel}</Button>
            </div>
          )}
        </Stack>
        <Surface variant="muted" radius="lg" className="aspect-square w-full overflow-hidden">
          {imageNode}
        </Surface>
      </Grid>
    </Container>
  );
}
