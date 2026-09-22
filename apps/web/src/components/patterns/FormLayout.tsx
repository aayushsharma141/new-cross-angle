import React from 'react';
import { Container, Surface, Stack, Divider, Cluster, Text } from '../primitives/foundation';

export const patternMeta = {
  genomeIds: ["P001", "P002", "P003", "P005", "P006", "P007"],
  intents: ["Form", "Input", "Submission"],
  reusable: true,
};

export interface FormLayoutProps {
  title: string;
  description?: string;
  formFields: React.ReactNode;
  actions: React.ReactNode;
}

export function FormLayout({ title, description, formFields, actions }: FormLayoutProps) {
  return (
    <Container size="sm" className="py-16">
      <Surface variant="primary" radius="lg" shadow="md" border className="p-8">
        <Stack gap="xl">
          <Stack gap="sm">
            <Text variant="h3">{title}</Text>
            {description && <Text variant="body" color="muted">{description}</Text>}
          </Stack>
          <Divider />
          <Stack gap="lg">
            {formFields}
          </Stack>
          <Cluster justify="end" className="mt-4">
            {actions}
          </Cluster>
        </Stack>
      </Surface>
    </Container>
  );
}
