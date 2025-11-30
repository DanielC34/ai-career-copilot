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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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

        // 6. Call Gemini to extract text
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
            Please extract all the text from this resume document. 
            Preserve the structure and sections (Experience, Education, Skills, etc.) as much as possible.
            Do not add any conversational text, just return the extracted content.
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

        const extractedText = result.response.text();

        if (!extractedText) {
            throw new Error('No text extracted from Gemini');
        }

        // 7. Update Resume in DB
        resume.extractedText = extractedText;
        resume.processed = true;
        await resume.save();

        return NextResponse.json({
            success: true,
            text: extractedText,
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
