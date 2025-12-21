/**
 * AI Service Layer
 * 
 * Responsibility: Transform raw text into structured JSON data using Gemini.
 * Constraints: No file parsing, no storage access, pure logic.
 */

import { model } from './gemini';
import type { ResumeStructuredData } from '@/types/resume';

/**
 * Centered, reusable prompt for resume parsing.
 */
const RESUME_PARSER_PROMPT = `
You are an expert resume parser. Extract all information from the provided raw resume text and return it as a structured JSON object.

IMPORTANT: Return ONLY valid JSON, no additional text, explanation, or markdown formatting.

The JSON MUST follow this exact structure:
{
    "contact": {
        "fullName": "string",
        "email": "string",
        "phone": "string (optional)",
        "location": "string (optional)",
        "linkedin": "string (optional)",
        "portfolio": "string (optional)",
        "github": "string (optional)",
        "website": "string (optional)"
    },
    "summary": "string (professional summary or objective, if present)",
    "experience": [
        {
            "jobTitle": "string",
            "company": "string",
            "location": "string (optional)",
            "startDate": "string (e.g., 'Jan 2020')",
            "endDate": "string (empty if current position)",
            "isCurrent": boolean,
            "responsibilities": ["string"],
            "achievements": ["string (optional)"]
        }
    ],
    "education": [
        {
            "degree": "string",
            "institution": "string",
            "location": "string (optional)",
            "graduationDate": "string (optional)",
            "gpa": "string (optional)",
            "honors": ["string (optional)"],
            "relevantCoursework": ["string (optional)"]
        }
    ],
    "skills": [
        {
            "category": "string (e.g., 'Programming Languages', 'Frameworks', 'Soft Skills')",
            "skills": ["string"]
        }
    ],
    "projects": [
        {
            "title": "string",
            "description": "string",
            "technologies": ["string (optional)"],
            "link": "string (optional)",
            "highlights": ["string (optional)"]
        }
    ],
    "certifications": [
        {
            "name": "string",
            "issuer": "string",
            "date": "string (optional)",
            "expirationDate": "string (optional)",
            "credentialId": "string (optional)",
            "credentialUrl": "string (optional)"
        }
    ],
    "languages": [
        {
            "language": "string",
            "proficiency": "Native | Fluent | Professional | Intermediate | Basic"
        }
    ],
    "awards": ["string"],
    "publications": ["string"],
    "volunteerWork": ["string"]
}

Guidelines:
1. Extract ALL information present in the text.
2. If a section is missing, use an empty array [] or null.
3. Preserve the original wording as much as possible for experience items.
4. Ensure the output is strictly valid JSON.
`;

/**
 * Structures raw resume text into JSON using Gemini.
 * 
 * @param rawText - Plain text extracted from a resume document.
 * @returns Promise<ResumeStructuredData> - Structured resume data.
 */
export async function structureResumeData(rawText: string): Promise<ResumeStructuredData> {
    console.log('[AI Service] Structuring resume data...');

    if (!rawText || rawText.trim().length < 50) {
        throw new Error('Raw text is too short or empty to be a valid resume.');
    }

    try {
        const fullPrompt = `${RESUME_PARSER_PROMPT}\n\nRAW RESUME TEXT:\n${rawText}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown markers if Gemini adds them despite instructions
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

        try {
            const structuredData = JSON.parse(cleanedText) as ResumeStructuredData;
            return structuredData;
        } catch (parseError) {
            console.error('[AI Service] JSON Parse Error:', parseError);
            console.error('[AI Service] Raw AI Output:', text);
            throw new Error('AI returned invalid JSON structure.');
        }
    } catch (error) {
        console.error('[AI Service] Gemini Generation Error:', error);
        throw new Error('Failed to structure resume data via AI.');
    }
}
