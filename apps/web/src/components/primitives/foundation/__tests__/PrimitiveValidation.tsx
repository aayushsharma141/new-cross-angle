import React from 'react';
import { Container, Stack, Cluster, Grid, Surface, Divider, Text } from '../index';

export function EntranceHero() {
  return (
    <Surface variant="primary" radius="none">
      <Container size="lg" className="py-24">
        <Stack gap="lg" align="center">
          <Text variant="display" align="center">The Entrance Hero</Text>
          <Text variant="body" color="muted" align="center">A hero section composed purely of primitives.</Text>
          <Cluster gap="md" justify="center">
            {/* Placeholders for Interactive Primitives (Buttons) */}
            <Surface variant="secondary" radius="md" className="px-6 py-3 cursor-pointer">
              <Text weight="medium">Get Started</Text>
            </Surface>
            <Surface variant="transparent" border radius="md" className="px-6 py-3 cursor-pointer">
              <Text weight="medium">Learn More</Text>
            </Surface>
          </Cluster>
        </Stack>
      </Container>
    </Surface>
  );
}

export function EditorialSplit() {
  return (
    <Container size="lg" className="py-16">
      <Grid cols={2} gap="2xl">
        <Stack gap="md" justify="center">
          <Text variant="label" color="accent">Editorial</Text>
          <Text variant="h2">The Editorial Split</Text>
          <Text variant="body" color="muted">
            This is an editorial split layout testing our text, stack, and grid primitives side by side with an image placeholder.
          </Text>
        </Stack>
        <Surface variant="muted" radius="lg" className="aspect-square w-full" />
      </Grid>
    </Container>
  );
}

export function GalleryGrid() {
  return (
    <Container size="lg" className="py-16">
      <Stack gap="xl">
        <Stack gap="sm" align="center">
          <Text variant="h3">Gallery Grid</Text>
          <Text variant="body" color="muted">Showcasing images in a responsive grid.</Text>
        </Stack>
        <Grid cols={3} gap="lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <Surface key={i} variant="muted" radius="md" className="aspect-[4/3] w-full" />
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}

export function WorkspacePanel() {
  return (
    <Surface variant="primary" radius="none" border className="h-[800px] flex w-full">
      <Grid cols={12} gap="none" className="w-full h-full">
        {/* 6. Sidebar */}
        <Surface variant="secondary" radius="none" className="col-span-3 p-4 h-full">
          <Stack gap="lg">
            <Text variant="h4">Sidebar</Text>
            <Divider />
            <Stack gap="sm">
              <Text variant="body">Item 1</Text>
              <Text variant="body">Item 2</Text>
              <Text variant="body">Item 3</Text>
            </Stack>
          </Stack>
        </Surface>
        
        {/* 4. Main Workspace */}
        <Surface variant="primary" radius="none" className="col-span-6 p-8 h-full">
          <Stack gap="lg">
            <Text variant="h2">Workspace Panel</Text>
            <Surface variant="muted" radius="md" className="h-64 w-full" />
          </Stack>
        </Surface>

        {/* 7. Dossier Card (Right Panel) */}
        <Surface variant="secondary" radius="none" border className="col-span-3 p-4 h-full">
          <Stack gap="md">
            <Text variant="h4">Dossier Card</Text>
            <Divider />
            <Surface variant="primary" radius="md" shadow="sm" border className="p-4">
              <Stack gap="sm">
                <Text variant="label" color="muted">Status</Text>
                <Text variant="body" weight="medium">Active</Text>
              </Stack>
            </Surface>
          </Stack>
        </Surface>
      </Grid>
    </Surface>
  );
}

export function FormSection() {
  return (
    <Container size="sm" className="py-16">
      <Surface variant="primary" radius="lg" shadow="md" border className="p-8">
        <Stack gap="xl">
          <Stack gap="sm">
            <Text variant="h3">Form Section</Text>
            <Text variant="body" color="muted">Testing structural layout for forms.</Text>
          </Stack>
          <Divider />
          <Stack gap="lg">
            {/* Simulated Form Field */}
            <Stack gap="xs">
              <Text variant="label">Email Address</Text>
              <Surface variant="muted" radius="md" className="h-10 w-full" />
            </Stack>
            <Stack gap="xs">
              <Text variant="label">Password</Text>
              <Surface variant="muted" radius="md" className="h-10 w-full" />
            </Stack>
          </Stack>
          <Cluster justify="end">
            <Surface variant="primary" radius="md" border className="px-4 py-2 cursor-pointer">
              <Text color="inverse">Submit</Text>
            </Surface>
          </Cluster>
        </Stack>
      </Surface>
    </Container>
  );
}

export default function PrimitiveValidationSuite() {
  return (
    <Stack gap="2xl" className="py-12 bg-neutral-100 dark:bg-neutral-900">
      <EntranceHero />
      <Divider variant="strong" />
      <EditorialSplit />
      <Divider variant="strong" />
      <GalleryGrid />
      <Divider variant="strong" />
      <FormSection />
      <Divider variant="strong" />
      <WorkspacePanel />
    </Stack>
  );
}
