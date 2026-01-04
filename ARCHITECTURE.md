# Resume Upload & Optimization Flow — System Architecture

This document describes the current system behavior for the AI Career Copilot resume optimization application. It is written for developers, reviewers, and future maintainers.

---

## Step 1: The Two Entry Paths

The system supports two distinct ways to create a resume. Understanding both is critical.

---

### A. Uploading a New Resume

When a user uploads a file (PDF, DOCX, DOC):

1. **Frontend**: User selects a file and an ATS template
2. **Signed URL Request**: Frontend calls `/api/upload/sign` to get a Supabase upload token
3. **Direct Storage Upload**: File is uploaded directly to Supabase Storage
4. **Resume Record Creation**: Frontend calls `POST /api/resumes` to create a database record
   - Stores: `fileName`, `storagePath`, `mimeType`, `size`, `userId`
   - Sets: `status: 'processing'`, `source: 'upload'`
5. **Processing Trigger**: Frontend calls `POST /api/resumes/[id]/process`
   - Downloads file from Supabase → Buffer
   - Extracts raw text via `parser.ts`
   - Calls AI to structure text into JSON
   - Runs deterministic ATS scoring
   - Saves `rawText`, `structuredData`, `analysis`, `atsScore`
6. **Polling**: Frontend polls the resume record until `status: 'completed'`

**What gets persisted:**
- Original file → Supabase Storage
- Raw text → `rawText` field
- Structured JSON → `structuredData` field
- ATS analysis → `analysis` field
- Score → `atsScore` field

---

### B. Using an Existing Resume

When a user reuses a previously uploaded resume:

1. **Frontend**: User selects from their resume library
2. **Resume Record Lookup**: System fetches the existing record by ID
3. **Skipped Steps**: No file upload, no storage write, no text extraction
4. **What is reused**: The `structuredData` JSON is used directly
5. **Processing**: May still call the process endpoint for re-scoring or tailoring

**Key difference:**
- Upload path creates `rawText` from file bytes
- Existing resume path uses the already-persisted `structuredData`

---

### Shared vs Skipped Steps

| Step | New Upload | Existing Resume |
|------|------------|-----------------|
| File storage | ✅ | ❌ Skipped |
| Text extraction | ✅ | ❌ Skipped |
| AI structuring | ✅ | ❌ (unless re-processing) |
| ATS scoring | ✅ | ✅ (can be re-run) |
| PDF generation | ✅ | ✅ |

---

## Step 2: The Core Invariant Artifact — The Canonical Resume

### What It Is

The **Canonical Resume** is a typed JSON object (`ResumeStructuredData`) that represents all resume content in a normalized, machine-readable format.

### Structure

```typescript
interface ResumeStructuredData {
  contact: { fullName, email, phone, location, linkedin, ... }
  summary: string
  experience: [{ jobTitle, company, responsibilities, ... }]
  education: [{ degree, institution, graduationDate, ... }]
  skills: [{ category, skills[] }]
  projects: [{ title, description, technologies, ... }]
  certifications: [{ name, issuer, date, ... }]
  languages: [{ language, proficiency }]
  awards: string[]
  publications: string[]
  volunteerWork: string[]
}
```

### Why It Matters

- **All downstream features depend on this structure**
- Scoring reads from `structuredData`
- PDF generation reads from `structuredData`
- Job tailoring transforms `structuredData`
- Template rendering consumes `structuredData`

> 🔒 **This must remain stable across the entire system.**
>
> Any change to this schema requires changes to:
> - AI prompts
> - Scoring logic
> - PDF renderers
> - Frontend displays

---

## Step 3: AI Responsibilities — Strictly Limited Scope

### What AI Is Allowed To Do

| Task | Description |
|------|-------------|
| **Text Extraction** | Convert raw document text into clean, machine-parseable text |
| **Structuring** | Map raw text into the `ResumeStructuredData` JSON schema |

### What AI Must Never Do

| Forbidden | Why |
|-----------|-----|
| Rewrite content | User's words must be preserved |
| Invent data | No hallucinated skills, jobs, or dates |
| Format layouts | Layout is handled by templates, not AI |
| Score resumes | Scoring is deterministic, not AI-driven |
| Generate PDFs | PDF generation is template-based, not AI |

### Terminology Clarification

- **AI Extraction**: Converting file bytes → raw text (handled by parser, not Gemini)
- **AI Structuring**: Converting raw text → JSON (handled by Gemini)
- **AI Tailoring**: Adjusting content for job descriptions (future feature)
- **AI Formatting**: ❌ Does not exist — formatting is deterministic

---

## Step 4: Resume Tailoring Flow

*(This describes the intended future flow. Current system does not fully implement tailoring.)*

### How It Would Work

1. **Job Description Input**: User pastes a job posting
2. **Canonical Resume Retrieved**: System loads `structuredData`
3. **AI Tailoring Request**: AI receives both resume JSON and job description
4. **Output**: A modified `structuredData` with:
   - Reordered skills to match job keywords
   - Adjusted bullet points to emphasize relevant experience
5. **What Does Not Change**:
   - Dates, job titles, company names (factual data)
   - Overall structure and section order
   - Education and certifications (usually static)

### Contract

- **Input**: `ResumeStructuredData` + Job Description string
- **Output**: `ResumeStructuredData` (same schema, adjusted content)

---

## Step 5: PDF Generation Stage

### What the PDF Generator Receives

The generator function `generateATSResumePDF()` receives:
- `data: ResumeStructuredData` — The structured JSON
- `templateId: ATSTemplateId` — The visual template to use

### Why Formatting Must Be Deterministic

- Users expect consistent output
- ATS systems require predictable, scannable layouts
- No AI involvement means no hallucinations or surprises
- Templates are purely visual — they do not alter content

### Why Templates Should Be Non-AI

| AI-Generated Layouts | Template-Based Layouts |
|---------------------|----------------------|
| Unpredictable | Consistent |
| May break ATS | Tested for ATS safety |
| Expensive per generation | Zero cost |
| Hard to debug | Easy to modify |

### Layout ≠ Content

- **Layout**: Where text appears, fonts, margins, spacing
- **Content**: What text says (names, jobs, skills)

Templates control layout. AI provides content structure. These must never mix.

---

## Step 6: Safe Change Zones

### 🔒 Must Remain Stable

| Item | Reason |
|------|--------|
| `ResumeStructuredData` interface | All features depend on this schema |
| `ResumeMeta` database schema | Stored records must remain compatible |
| AI prompt structure | Changes affect all future parses |
| `analyzeResume()` scoring contract | Expected by frontend and history |
| `POST /api/resumes/[id]/process` response shape | Frontend depends on this |

### 🔧 Safe to Change or Extend

| Item | Safe Modifications |
|------|-------------------|
| Storage provider | Supabase → Cloudflare R2, AWS S3 |
| PDF templates | Add new templates, modify layouts |
| Visual styling | Colors, fonts, spacing |
| Upload UI | Drag-drop, preview enhancements |
| Template selection UI | New grid, cards, animations |
| Polling mechanism | Switch to WebSocket or SSE |
| Logging format | Add more metrics, change format |

---

## Step 7: Current Pain Points

### Where Bugs Are Most Likely

| Area | Risk |
|------|------|
| PDF parsing | Different PDF encodings, scanned images |
| AI JSON output | Gemini may return malformed JSON |
| Supabase connectivity | Network timeouts, auth failures |
| Large files | Memory pressure during parsing |
| Template switching | UI state may not sync with backend |

### Where User Experience Can Degrade

| Issue | Impact |
|-------|--------|
| Long processing times | Users abandon upload |
| Vague error messages | Users don't know how to fix |
| Missing progress indicators | Users think system is frozen |
| Template mismatch | Preview differs from downloaded PDF |

### Where Performance Can Be Improved

| Opportunity | Benefit |
|-------------|---------|
| Cache parsed resumes | Avoid re-parsing on revisit |
| Stream PDF generation | Reduce memory for large resumes |
| Lazy-load templates | Faster initial page load |
| Batch ATS analysis | Process multiple resumes in one call |

---

## Summary

This architecture is sound because it enforces strict separation of concerns:

- **Storage** handles files only
- **Parser** handles text extraction only
- **AI** handles structuring only (never formatting or scoring)
- **Scoring** is deterministic and testable
- **PDF generation** is template-driven and predictable
- **The Canonical Resume (`structuredData`)** acts as the single source of truth that all features consume

This design supports future improvements such as new PDF templates, storage provider changes, and job-tailoring features **without breaking existing functionality**, because each layer has clear inputs and outputs. As long as `ResumeStructuredData` remains stable, the entire system remains stable.
