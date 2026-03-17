# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests with Vitest
npm run db:reset     # Reset SQLite database
```

Run a single test file:
```bash
npx vitest src/lib/__tests__/file-system.test.ts
```

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. Without it, the app falls back to a mock provider that returns static code.

## Architecture

This is an AI-powered React component generator. Users describe components in a chat interface; Claude generates and edits files in a virtual file system, and the result is previewed live in an iframe.

### Request Flow

1. Chat messages go to `src/app/api/chat/route.ts` via Vercel AI SDK `streamText`
2. Claude streams back text and tool calls using two tools defined in `src/lib/tools/`:
   - `str_replace_editor` — creates/edits file content via string replacement
   - `file_manager` — creates/renames/deletes files and folders
3. Tool calls mutate the **virtual file system** (in-memory `VirtualFileSystem` class in `src/lib/file-system.ts`)
4. The preview iframe re-renders on every file change

### Virtual File System

`VirtualFileSystem` is an in-memory tree of files. It is **not** the disk — all generated code lives here. The state is serialized as JSON and persisted to SQLite via Prisma when the project is saved.

### Live Preview

`src/components/preview/PreviewFrame.tsx` renders an iframe with `srcdoc`. On each change, `src/lib/transform/jsx-transformer.ts` uses Babel standalone to transpile JSX and builds an import map pointing to `esm.sh` for third-party packages. The iframe loads the entry point (`App.jsx` or `index.jsx`).

### State Management

Two React contexts own all shared state:
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — virtual FS state and operations
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — messages and AI streaming state

### Authentication

JWT sessions stored in cookies. `src/middleware.ts` protects `/[projectId]` routes. Server actions in `src/actions/` handle sign-up/in/out and session reads. Passwords are hashed with bcrypt.

### AI System Prompt

`src/lib/prompts/generation.tsx` contains the system prompt that instructs Claude how to generate and edit React components using the two tools.

### Database

Prisma with SQLite (`prisma/dev.db`). Schema has two models: `User` and `Project`. `Project.messages` and `Project.data` are JSON strings storing chat history and the serialized virtual file system respectively.

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it whenever you need to understand the structure of data stored in the database.

### Path Alias

`@/*` maps to `src/*` throughout the codebase.

## Code Style

Use comments sparingly — only for complex or non-obvious logic.

### UI Components

Shadcn UI (new-york style) with Radix UI primitives and Tailwind CSS 4. Components are in `src/components/ui/`. The main layout uses `react-resizable-panels` for the three-pane view (chat | preview | editor).
