import React from 'react';
import { Surface, Stack, Divider, Text, Cluster } from '../primitives/foundation';
import { Badge } from '../primitives/interactive';

export const patternMeta = {
  genomeIds: ["P002", "P003", "P005", "P006", "P007", "P015"],
  intents: ["Dossier", "Details", "Metadata"],
  reusable: true,
};

export interface DossierLayoutProps {
  title: string;
  status: string;
  metadata: { label: string; value: string }[];
}

export function DossierLayout({ title, status, metadata }: DossierLayoutProps) {
  return (
    <Stack gap="md">
      <Text variant="h4">{title}</Text>
      <Divider />
      <Surface variant="primary" radius="md" shadow="sm" border className="p-4">
        <Stack gap="md">
          <Cluster justify="between" align="center">
            <Text variant="label" color="muted">Status</Text>
            <Badge variant="outline">{status}</Badge>
          </Cluster>
          <Divider variant="subtle" />
          {metadata.map((item, i) => (
            <Stack key={i} gap="xs">
              <Text variant="label" color="muted">{item.label}</Text>
              <Text variant="body" weight="medium">{item.value}</Text>
            </Stack>
          ))}
        </Stack>
      </Surface>
    </Stack>
  );
}
