import React from 'react';
import { Stack, Divider, Text } from '../primitives/foundation';
import { Link } from '../primitives/interactive';

export const patternMeta = {
  genomeIds: ["P002", "P006", "P007", "P009"],
  intents: ["Navigation", "Sidebar", "Menu"],
  reusable: true,
};

export interface SidebarLayoutProps {
  title: string;
  navItems: { label: string; href: string }[];
}

export function SidebarLayout({ title, navItems }: SidebarLayoutProps) {
  return (
    <Stack gap="lg">
      <Text variant="h4">{title}</Text>
      <Divider />
      <Stack gap="sm">
        {navItems.map((item, i) => (
          <Link key={i} href={item.href} variant="muted" underline="none">
            {item.label}
          </Link>
        ))}
      </Stack>
    </Stack>
  );
}
