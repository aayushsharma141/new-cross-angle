# Components Directory

This directory contains the reusable UI components for the application.

## Structure

- **`ui/`**: Core design system components (buttons, inputs, dialogs, etc.). These are built using `shadcn/ui` and `radix-ui`.
- **`admin/`**: Components specific to the Admin Dashboard (e.g., `ConfirmDialog`, `MediaGrid`).
- **`gallery/`**: Components for the Portfolio/Gallery section.
- **`home/`**: Components used primarily on the landing page.
- **`contact/`**: Contact form and related components.

## Guidelines

- **Style**: Use Tailwind CSS for styling.
- **Icons**: Use `lucide-react`.
- **Animation**: Use `framer-motion` for complex animations.
- **Props**: All components must be typed with TypeScript interfaces.
