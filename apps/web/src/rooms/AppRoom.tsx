import React from 'react';
import { WorkspacePanel, SidebarLayout, DossierLayout, FormLayout } from '../components/patterns';
import { Input, Button } from '../components/primitives/interactive';
import { Stack, Text } from '../components/primitives/foundation';

export function AppRoom() {
  return (
    <WorkspacePanel 
      sidebar={
        <SidebarLayout 
          title="Project Settings"
          navItems={[
            { label: 'General', href: '#' },
            { label: 'Team', href: '#' },
            { label: 'Billing', href: '#' },
          ]}
        />
      }
      mainContent={
        <Stack gap="xl">
          <Text variant="h2">General Settings</Text>
          <FormLayout 
            title="Profile"
            description="Update your personal details here."
            formFields={
              <Stack gap="lg">
                <Stack gap="xs">
                  <Text variant="label">Display Name</Text>
                  <Input placeholder="Jane Doe" />
                </Stack>
                <Stack gap="xs">
                  <Text variant="label">Email</Text>
                  <Input type="email" placeholder="jane@example.com" />
                </Stack>
              </Stack>
            }
            actions={<Button variant="primary">Save Changes</Button>}
          />
        </Stack>
      }
      dossierContent={
        <DossierLayout 
          title="Account Info"
          status="Active"
          metadata={[
            { label: 'Role', value: 'Administrator' },
            { label: 'Joined', value: 'Oct 2023' },
            { label: 'Last Login', value: 'Today' },
          ]}
        />
      }
    />
  );
}
