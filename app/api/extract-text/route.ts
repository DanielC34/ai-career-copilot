/**
 * Extract Text API Route
 * 
 * NOTE: Automatic PDF text extraction is temporarily disabled
 * due to Gemini API model availability issues.
 * 
 * Users should upload files and then manually paste the text.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';

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

        // Automatic extraction is currently disabled
        // Return fallback message
        return NextResponse.json({
            success: false,
            error: 'Automatic text extraction is temporarily unavailable. Please paste your CV text manually.',
            fallback: true,
        }, { status: 503 });

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
