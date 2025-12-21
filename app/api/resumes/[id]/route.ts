/**
 * Resume Detail API Route
 * 
 * GET /api/resumes/[id]
 * 
 * Fetches single resume metadata, including processing status and AI analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user.id;

        await connectToDatabase();

        const resume = await Resume.findOne({ _id: id, userId });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            resume: {
                _id: resume._id,
                fileName: resume.fileName,
                status: resume.status,
                processed: resume.processed,
                atsScore: resume.atsScore,
                analysis: resume.analysis,
                rawText: resume.rawText,
                structuredData: resume.structuredData,
                uploadedAt: resume.uploadedAt
            }
        });
    } catch (error) {
        console.error('[Resume GET] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
