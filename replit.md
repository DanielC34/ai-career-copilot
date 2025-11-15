# AI Career Copilot

## Project Overview
AI Career Copilot is a full-stack web application built with Next.js that helps users generate tailored job application materials using OpenAI's GPT-5 model. The application analyzes a user's CV against a job description and creates a complete application package.

## Current State
The application is fully functional with the following features:
- Landing page with project introduction
- CV and job description input pages with validation
- AI-powered content generation via OpenAI API
- Results page with tabbed interface showing:
  - Rewritten CV tailored to the job
  - Professional cover letter
  - Skills match analysis
  - Skills gap identification
  - Interview preparation questions
  - Application summary
- Copy-to-clipboard functionality for all sections
- Toast notifications for user feedback
- Loading states during AI generation

## Tech Stack
- **Framework**: Next.js 16 (App Router) with Turbopack
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 with @tailwindcss/postcss
- **State Management**: Zustand
- **AI Integration**: OpenAI GPT-5 API
- **UI Libraries**: react-hot-toast for notifications
- **Development**: ESLint for code quality

## Project Architecture

### Frontend Structure
```
app/
├── page.tsx                    # Landing page
├── generate/
│   └── page.tsx               # CV and job description input
├── results/
│   └── page.tsx               # Results display with tabs
├── api/
│   └── generate/
│       └── route.ts           # OpenAI API integration
├── layout.tsx                 # Root layout with Toaster
└── globals.css                # Global styles with Tailwind directives
```

### State Management
```
store/
└── useAppStore.ts             # Zustand store for app state
```

### Configuration Files
- `next.config.ts` - Next.js configuration with Turbopack
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - TailwindCSS configuration
- `postcss.config.js` - PostCSS with @tailwindcss/postcss plugin

## Environment Setup

### Required Environment Variables
- `OPENAI_API_KEY` - OpenAI API key (managed via Replit integration)

### Development Server
The application runs on port 5000 and is configured to accept all hosts for Replit's preview environment.

Command: `npm run dev`

## Recent Changes (November 15, 2025)
- Initial project setup with Next.js 16 and TypeScript
- Configured TailwindCSS v4 with @tailwindcss/postcss plugin
- Implemented OpenAI integration using GPT-5 model
- Created complete user flow from landing page to results
- Added input validation (100+ chars for CV, 50+ chars for job description)
- Implemented Zustand store for state management
- Added toast notifications and loading states
- Configured Turbopack for optimal development experience

## User Workflow
1. User visits landing page and clicks "Get Started"
2. User pastes their CV (minimum 100 characters)
3. User pastes job description (minimum 50 characters)
4. User clicks "Generate Application Pack"
5. API route processes request and calls OpenAI GPT-5
6. AI generates comprehensive application package in JSON format
7. Results page displays content in tabbed interface
8. User can copy any section to clipboard
9. User can start over to generate new content

## AI Prompt Strategy
The application sends a structured prompt to OpenAI that:
- Provides both CV and job description as context
- Requests JSON output with specific fields
- Uses response_format: { type: "json_object" } for reliable parsing
- Generates 6 key sections: rewritten CV, cover letter, skills match, skills gap, interview questions, and summary
- Uses max_completion_tokens: 8192 for comprehensive responses

## Future Enhancement Ideas
- Download functionality for generated content (.txt or .md format)
- User authentication and application history
- PDF upload support for CV parsing
- Side-by-side comparison view (original vs AI-enhanced)
- Multiple tone/style options for generation
- Save and retrieve past generations
- Share generated content via link
- Export to common formats (DOCX, PDF)

## Dependencies
### Production
- next (16.0.3)
- react (19.2.0)
- react-dom (19.2.0)
- zustand (state management)
- react-hot-toast (notifications)
- openai (GPT-5 API client)

### Development
- typescript (5.9.3)
- @types/react, @types/node
- @tailwindcss/postcss (4.1.17)
- autoprefixer
- postcss
- eslint, eslint-config-next

## Notes
- The application uses Next.js App Router (not Pages Router)
- TailwindCSS v4 requires @tailwindcss/postcss instead of the legacy tailwindcss plugin
- OpenAI GPT-5 model doesn't support temperature parameter
- The application is optimized for Replit's environment with proper host configuration
- LSP diagnostics showing React UMD warnings are benign (React 19 doesn't require explicit imports in JSX)
