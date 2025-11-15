# AI Career Copilot

An AI-powered web application that helps you generate tailored job application materials.

## Features

- **CV Input**: Paste your current CV
- **Job Description Analysis**: Add the job posting you're applying for
- **AI-Generated Content**:
  - Rewritten CV tailored to the job
  - Professional cover letter
  - Skills match analysis
  - Skills gap identification
  - Interview preparation questions
  - Application summary

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **State Management**: Zustand
- **AI Integration**: OpenAI GPT-5
- **UI Components**: React Hot Toast for notifications

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your OpenAI API key:
   - Add `OPENAI_API_KEY` to your environment variables
   - The app will prompt you if the key is not configured

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5000](http://localhost:5000) in your browser

## Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key for generating AI content

## Usage

1. Navigate to the landing page
2. Click "Get Started"
3. Paste your CV (minimum 100 characters)
4. Paste the job description (minimum 50 characters)
5. Click "Generate Application Pack"
6. View your results in the tabbed interface
7. Copy sections to your clipboard as needed

## Project Structure

```
app/
├── api/
│   └── generate/
│       └── route.ts          # OpenAI API integration
├── generate/
│   └── page.tsx              # Input page for CV and job description
├── results/
│   └── page.tsx              # Results display with tabs
├── globals.css               # Global styles
├── layout.tsx                # Root layout with toast provider
└── page.tsx                  # Landing page

store/
└── useAppStore.ts            # Zustand state management
```

## Future Enhancements

- Download generated content as .txt or .md files
- User authentication and application history
- PDF upload support for CV parsing
- Comparison view (original vs AI-enhanced)
- Multiple tone/style options for generation
