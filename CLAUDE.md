# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe React components in natural language, and the AI generates functional components displayed in real-time. The project uses a virtual file system (files are not written to disk) and renders components in an isolated iframe preview.

## Tech Stack

- **Next.js 15** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma** with SQLite database
- **Anthropic Claude AI** (Haiku 4.5) via Vercel AI SDK
- **Vitest** for testing with jsdom

## Code Style

- Use comments sparingly. Only comment complex code.

## Development Commands

### Setup and Installation
```bash
npm run setup              # Install dependencies + generate Prisma client + run migrations
```

### Development
```bash
npm run dev                # Start dev server with Turbopack at localhost:3000
npm run dev:daemon         # Start dev server in background, logs to logs.txt
npm run build              # Build for production
npm start                  # Start production server
```

### Database
```bash
npx prisma generate        # Generate Prisma client to src/generated/prisma/
npx prisma migrate dev     # Create and apply migrations
npm run db:reset           # Reset database (drop all data)
npx prisma studio          # Open Prisma Studio GUI
```

### Testing
```bash
npm run test               # Run all tests with Vitest
npm run test -- --watch    # Run tests in watch mode
npm run test -- path/to/file.test.tsx  # Run specific test file
```

### Linting
```bash
npm run lint               # Run ESLint
```

## Architecture

### Virtual File System

The core of UIGen is a **VirtualFileSystem** (`src/lib/file-system.ts`) that manages all generated code in-memory without writing to disk. This allows for instant preview updates and easy serialization for database storage.

- **Implementation**: Custom class using Map to store file nodes with path-based lookup
- **Serialization**: Files are serialized to JSON and stored in the Prisma database
- **Operations**: Supports create, read, update, delete, rename, and directory operations

### AI Agent Flow

1. **User Message**: User describes desired component in chat
2. **API Endpoint**: `/src/app/api/chat/route.ts` receives message and file system state
3. **AI Tools**: Agent uses two tools to manipulate files:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`): Create files, replace strings, insert lines
   - `file_manager` (`src/lib/tools/file-manager.ts`): Rename and delete files/directories
4. **Tool Execution**: Tools execute operations on VirtualFileSystem instance
5. **State Update**: FileSystemContext propagates changes to UI components
6. **Preview Update**: PreviewFrame component transforms JSX to executable HTML
7. **Persistence**: On completion, messages and file system serialized to database (for authenticated users)

### React Context Architecture

**ChatContext** (`src/lib/contexts/chat-context.tsx`):
- Manages AI chat state using `useAIChat` from Vercel AI SDK
- Sends file system state with each message to maintain context
- Handles anonymous work tracking via localStorage

**FileSystemContext** (`src/lib/contexts/file-system-context.tsx`):
- Provides VirtualFileSystem instance to entire app
- Manages selected file state for code editor
- Handles tool call processing from AI agent
- Triggers UI refreshes when file system changes

### Preview Rendering

The preview system (`src/components/preview/PreviewFrame.tsx` and `src/lib/transform/jsx-transformer.ts`) converts generated JSX/TSX files into executable HTML:

1. **Import Map Creation**: All files converted to blob URLs with proper module resolution
2. **JSX Transformation**: Babel Standalone transforms JSX to executable JavaScript
3. **HTML Generation**: Creates complete HTML document with:
   - Import map for module resolution
   - React and ReactDOM from CDN
   - Inline styles and Tailwind CSS
   - Error boundaries for runtime error handling
4. **Sandboxed Execution**: Renders in iframe with `allow-scripts allow-same-origin` sandbox

### Authentication

- JWT-based authentication using `jose` library (`src/lib/auth.ts`)
- Session cookies with secure, httpOnly flags
- Middleware (`src/middleware.ts`) protects authenticated routes
- Password hashing with `bcrypt`
- Anonymous users can use the app but data is not persisted to database

### Mock Provider

When `ANTHROPIC_API_KEY` is not set in `.env`, the app uses a **MockLanguageModel** (`src/lib/provider.ts`) that generates static demo components. This allows development and testing without API costs.

## Key Files and Directories

### Core Logic
- `src/lib/file-system.ts` - Virtual file system implementation
- `src/lib/contexts/chat-context.tsx` - AI chat state management
- `src/lib/contexts/file-system-context.tsx` - File system state management
- `src/lib/tools/` - AI agent tools (str-replace, file-manager)
- `src/lib/transform/jsx-transformer.ts` - JSX to preview HTML transformation
- `src/lib/provider.ts` - Language model provider (Anthropic or Mock)
- `src/lib/prompts/generation.tsx` - System prompt for AI agent

### API
- `src/app/api/chat/route.ts` - Streaming AI chat endpoint (maxDuration: 120s)

### Components
- `src/components/chat/` - Chat interface (MessageList, MessageInput, ChatInterface)
- `src/components/editor/` - Code editor with Monaco and file tree
- `src/components/preview/PreviewFrame.tsx` - Live component preview iframe
- `src/components/auth/` - Sign up/in forms and auth dialog

### Database
- `prisma/schema.prisma` - Database schema (User, Project models). Reference this file anytime you need to understand the structure of data stored in the database.
- Generated client: `src/generated/prisma/`

## Important Notes

### Node Compatibility
The project uses a custom Node.js compatibility shim (`node-compat.cjs`) loaded via `NODE_OPTIONS` in all scripts. This is required for Turbopack compatibility.

### Import Paths
Components use `@/` path alias which maps to `src/` directory (configured in `tsconfig.json`).

### Database Location
SQLite database file: `prisma/dev.db`

### Generated Code
The Prisma client is generated to `src/generated/prisma/` instead of the default `node_modules/@prisma/client/` location. This is configured in the Prisma schema.

### Preview Entry Point
The preview system looks for these files as entry points (in order):
1. `/App.jsx`
2. `/App.tsx`
3. `/index.jsx`
4. `/index.tsx`
5. `/src/App.jsx`
6. `/src/App.tsx`

If none exist, it falls back to the first `.jsx` or `.tsx` file found.

### Testing
Tests use Vitest with jsdom environment. Component tests are located in `__tests__/` directories alongside the components they test.
