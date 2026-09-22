import React from 'react';
import { Container, Stack, Cluster, Surface, Text } from '../primitives/foundation';
import { Button } from '../primitives/interactive';

export const patternMeta = {
  genomeIds: ["P001", "P002", "P003", "P005", "P007", "P008"],
  intents: ["Editorial", "Hero", "Arrival"],
  reusable: true,
};

export interface EditorialHeroProps {
  title: string;
  subtitle: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

export function EditorialHero({ title, subtitle, primaryActionLabel, secondaryActionLabel }: EditorialHeroProps) {
  return (
    <Surface variant="primary" radius="none">
      <Container size="lg" className="py-24">
        <Stack gap="lg" align="center">
          <Text variant="display" align="center">{title}</Text>
          <Text variant="body" color="muted" align="center">{subtitle}</Text>
          <Cluster gap="md" justify="center">
            <Button variant="primary" size="lg">{primaryActionLabel}</Button>
            <Button variant="ghost" size="lg">{secondaryActionLabel}</Button>
          </Cluster>
        </Stack>
      </Container>
    </Surface>
  );
}
