/**
 * Resume Processing API Route
 * 
 * POST /api/resumes/[id]/process
 * 
 * Orchestrates the full resume processing pipeline:
 * 1. Fetch metadata (MongoDB)
 * 2. Download file (Supabase)
 * 3. Extract raw text (Parser)
 * 4. Structure data (AI Service)
 * 5. Analyze compatibility (Scoring)
 * 6. Update database
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import { getResumeBuffer } from '@/lib/storage';
import { extractRawText } from '@/lib/parser';
import { structureResumeData } from '@/lib/ai-service';
import { analyzeResume } from '@/lib/scoring';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user.id;

        await connectToDatabase();

        // 2. Fetch Resume Record
        const resume = await Resume.findOne({ _id: id, userId });
        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        console.log(`[Process] Starting pipeline for resume: ${id}`);

        try {
            // Update status to processing (Idempotency)
            resume.status = 'processing';
            await resume.save();

            // 3. Download File Buffer
            const buffer = await getResumeBuffer(resume.storagePath);
            if (!buffer) throw new Error('Failed to download resume from storage');

            // 4. Extract Raw Text (Parser Layer)
            const rawText = await extractRawText(buffer, resume.mimeType);
            if (!rawText) throw new Error('No text content found in document');

            // 5. Structure Data (AI Service Layer)
            const structuredData = await structureResumeData(rawText);

            // 6. Analyze & Score (Scoring Layer)
            const analysis = analyzeResume(structuredData);

            // 7. Update Record (Final State)
            resume.rawText = rawText;
            resume.structuredData = structuredData;
            resume.analysis = analysis;
            resume.atsScore = analysis.score;
            resume.status = 'completed';
            resume.processed = true;
            await resume.save();

            console.log(`[Process] Pipeline completed successfully for: ${id}`);

            return NextResponse.json({
                success: true,
                status: 'completed',
                atsScore: analysis.score
            });

        } catch (pipelineError) {
            console.error(`[Process] Pipeline failed for ${id}:`, pipelineError);

            // Persist failure state
            resume.status = 'failed';
            await resume.save();

            return NextResponse.json({
                success: false,
                error: pipelineError instanceof Error ? pipelineError.message : 'Pipeline interrupted'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('[Process] Orchestration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
