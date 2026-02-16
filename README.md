# ⚡ DevPulse - Developer Utility Suite

DevPulse is a comprehensive collection of developer tools integrated with AI capabilities. Built with React, TypeScript, and Tailwind CSS, it aims to boost productivity by providing essential utilities in a single, well-designed interface.

## 🚀 Features

- ⌘ **Global Command Palette**: Quickly access tools with `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux).
- ⌨️ **Keyboard-First Navigation**: Optimized for power users with keyboard shortcuts and navigation.
- 🌑 **Dark Mode UI**: Clean, modern interface designed for extended coding sessions.
- 🔗 **Dynamic Routing**: Instant tool switching with URL synchronization.
- 🤖 **AI-Powered Assistance**: Integrated Gemini AI smart assistant for code analysis and problem-solving.

### 🛠️ Available Tools

1.  📝 **JSON Formatter**: Prettify, minify, and validate JSON data.
2.  🔢 **Base64 Tool**: Encode and decode strings/files to Base64.
3.  🔠 **Case Converter**: Switch between camelCase, PascalCase, snake_case, kebab-case, and more.
4.  🔐 **Password Generator**: Create secure, random passwords instantly with customizable options.
5.  🌍 **Timezone Converter**: Easily convert dates and times across different global timezones.
6.  📅 **Thai Date Converter**: Convert Gregorian dates to Thai Buddhist Era (BE) formats.
7.  ⏰ **Crontab Guru**: Generate and explain cron schedule expressions.
8.  ✨ **AI Smart Assistant**: Analyze code snippets and get intelligent suggestions.
9.  🆔 **UUID Generator**: Create Version 4 UUIDs (GUIDs).
10. 🔗 **URL Parser**: Parse, encode, and decode URLs.

## 💻 Tech Stack

- ⚛️ **Frontend**: React 19, TypeScript, Vite
- 🎨 **Styling**: Tailwind CSS
- 🔹 **Icons**: Lucide React
- 🧠 **AI**: Google Gemini API
- 🛣️ **Routing**: React Router DOM

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 📥 Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/devpulse.git
    cd devpulse
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  **Configure API Key**:
    You can configure the Gemini API key in two ways:
    - **Option A (Recommended for local dev)**: Create a `.env.local` file in the root directory:
      ```env
      GEMINI_API_KEY=your_gemini_api_key_here
      ```
    - **Option B (UI)**: Enter your key directly in the AI Assistant settings (stored securely in browser local storage).

    You can get an API key from [Google AI Studio](https://aistudio.google.com/).

4.  Run the development server:

    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

## Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K`: Open Command Palette
- `Arrow Up/Down`: Navigate Sidebar or Command Palette results
- `Enter`: Select Tool

## License

This project is open source and available under the [MIT License](LICENSE).
