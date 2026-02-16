# Developer Tools Components

This directory contains the individual tool components used in the DevUtil application.

## Architecture

The tools have been refactored to follow a **Hook-View** pattern (Separation of Concerns):

1.  **Logic**: All business logic, state management, and side effects are extracted into custom hooks located in `src/hooks/`.
2.  **UI**: The components in this directory strictly handle the presentation layer using shared UI components.

## Available Tools

| Tool Component | Context/Hook | Description |
|---|---|---|
| `JSONFormatter.tsx` | `useJsonFormatter` | Formats, validates, and minifies JSON data. |
| `Base64Tool.tsx` | `useBase64` | Encodes and decodes Base64 strings. |
| `CaseConverter.tsx` | `useCaseConverter` | Converts text casing (camelCase, snake_case, PascalCase, etc.). |
| `PasswordGenerator.tsx` | `usePasswordGenerator` | Generates secure passwords with customizable criteria. |
| `ThaiDateConverter.tsx` | `useThaiDateConverter` | Converts between Thai/Buddhist dates and ISO formats. |
| `TimezoneConverter.tsx` | *(Pending Refactor)* | Converts dates/times across different timezones. |
| `CrontabTool.tsx` | - | Link to Crontab.guru for managing cron expressions. |
| `AIAssistant.tsx` | `askGemini` (Service) | AI-powered coding assistant using Google Gemini. |

## Shared UI Components

Tools utilize shared components from `components/ui/` for consistency:

-   **`ToolLayout`**: Standardizes the layout structure (Header, Sections, Panels).
-   **`CopyButton`**: Provides uniform copy-to-clipboard functionality with toast notifications.
-   **`Card`**: Shadcn UI based card component for grouping content.
