# Components

This directory contains the React components that make up the DevUtil application.

## Directory Structure

- **`tools/`**: Contains the individual developer utility tools (e.g., UUID Generator, JSON Formatter). Each tool is a self-contained component.
  - [Read more about Tools](./tools/README.md)
- **`ui/`**: Contains the shared, reusable UI components and the core layout system. These are the building blocks for the application's design system.
  - [Read more about UI Components](./ui/README.md)

## Application Components

The root of this directory contains the high-level layout and navigation components that orchestrate the application structure.

| Component            | Description                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MainLayout.tsx`     | The top-level wrapper for the application. It manages the sidebar, header, and main content area responsiveness.                                        |
| `Sidebar.tsx`        | The navigation sidebar containing links to all available tools.                                                                                         |
| `Header.tsx`         | The application header, containing the mobile menu trigger, command palette trigger, and theme toggle.                                                  |
| `Dashboard.tsx`      | The landing page of the application, displaying a grid of quick-access links to all tools.                                                              |
| `CommandPalette.tsx` | A global search modal (Cmd+K) for quickly finding and navigating to tools.                                                                              |
| `ToolPageLayout.tsx` | A wrapper specific to tool pages, potentially handling tool-specific layout needs (often replaced or augmented by `ToolLayout` inside the tool itself). |
