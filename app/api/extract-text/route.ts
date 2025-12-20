/**
 * Extract Text API Route
 * 
 * Uses Google Gemini to extract text from uploaded PDF/DOCX files.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import { downloadResume } from '@/lib/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ResumeStructuredData } from '@/types/resume';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

/**
 * Calculate ATS compatibility score based on resume completeness
 * Returns a score from 0-100
 */
function calculateATSScore(data: ResumeStructuredData): number {
    let score = 0;

    // Contact Information (20 points)
    if (data.contact) {
        if (data.contact.fullName) score += 5;
        if (data.contact.email) score += 5;
        if (data.contact.phone) score += 3;
        if (data.contact.location) score += 3;
        if (data.contact.linkedin || data.contact.portfolio || data.contact.github) score += 4;
    }

    // Professional Summary (10 points)
    if (data.summary && data.summary.length > 50) {
        score += 10;
    } else if (data.summary && data.summary.length > 0) {
        score += 5;
    }

    // Work Experience (30 points)
    if (data.experience && Array.isArray(data.experience)) {
        const expCount = data.experience.length;
        if (expCount >= 3) {
            score += 15;
        } else if (expCount >= 2) {
            score += 12;
        } else if (expCount >= 1) {
            score += 8;
        }

        // Check if experiences have bullet points
        const hasDetails = data.experience.some(exp =>
            exp.responsibilities && exp.responsibilities.length > 0
        );
        if (hasDetails) score += 15;
    }

    // Education (15 points)
    if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        score += 10;
        // Bonus for multiple degrees or honors
        if (data.education.length > 1 || data.education.some(edu => edu.honors && edu.honors.length > 0)) {
            score += 5;
        }
    }

    // Skills (15 points)
    if (data.skills && Array.isArray(data.skills)) {
        const totalSkills = data.skills.reduce((count, category) =>
            count + (category.skills?.length || 0), 0
        );
        if (totalSkills >= 10) {
            score += 15;
        } else if (totalSkills >= 5) {
            score += 10;
        } else if (totalSkills > 0) {
            score += 5;
        }
    }

    // Additional sections (10 points total)
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        score += 3;
    }
    if (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
        score += 3;
    }
    if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
        score += 2;
    }
    if (data.awards && Array.isArray(data.awards) && data.awards.length > 0) {
        score += 2;
    }

    // Ensure score is between 0 and 100
    return Math.min(Math.max(score, 0), 100);
}


export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get resume ID from request
        const { resumeId } = await request.json();
        if (!resumeId) {
            return NextResponse.json({ error: 'Resume ID required' }, { status: 400 });
        }

        await connectToDatabase();

        // 3. Fetch resume metadata
        const resume = await Resume.findOne({
            _id: resumeId,
            // @ts-expect-error - session.user.id is added in auth.ts
            userId: session.user.id,
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Check if already processed
        if (resume.processed && resume.extractedText) {
            return NextResponse.json({
                success: true,
                text: resume.extractedText,
                cached: true,
            });
        }

        // 4. Download file from Supabase
        const fileBlob = await downloadResume(resume.storagePath);

        if (!fileBlob) {
            return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
        }

        // 5. Convert blob to base64
        const arrayBuffer = await fileBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        // 6. Call Gemini to extract structured text
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
            You are an expert resume parser. Extract all information from this resume document and return it as a structured JSON object.
            
            IMPORTANT: Return ONLY valid JSON, no additional text or explanation.
            
            The JSON should follow this exact structure:
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
                "awards": ["string (optional)"],
                "publications": ["string (optional)"],
                "volunteerWork": ["string (optional)"]
            }
            
            Rules:
            1. Extract ALL information present in the resume
            2. If a section is not present, use an empty array [] or null
            3. Preserve the exact wording from the resume for experience/education entries
            4. Group skills by logical categories
            5. For dates, use the format shown in the resume
            6. Return ONLY the JSON object, no markdown code blocks or explanations
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: resume.mimeType,
                },
            },
        ]);

        const responseText = result.response.text();

        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        // Clean the response - remove markdown code blocks if present
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        // Parse the structured data
        let structuredData;
        try {
            structuredData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse Gemini response as JSON:', parseError);
            console.error('Response was:', cleanedResponse);
            throw new Error('Failed to parse resume structure. Please try again.');
        }

        // Calculate ATS score based on content completeness
        const atsScore = calculateATSScore(structuredData);

        // 7. Update Resume in DB with both raw and structured data
        resume.extractedText = JSON.stringify(structuredData, null, 2); // Store formatted JSON as text
        resume.structuredData = structuredData;
        resume.atsScore = atsScore;
        resume.processed = true;
        await resume.save();

        return NextResponse.json({
            success: true,
            text: resume.extractedText,
            structuredData,
            atsScore,
        });

    } catch (error) {
        console.error('Text extraction error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to extract text',
                fallback: true,
            },
            { status: 500 }
        );
    }
}
