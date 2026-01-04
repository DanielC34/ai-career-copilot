/**
 * Resume Detail API Route
 * 
 * GET /api/resumes/[id]
 * DELETE /api/resumes/[id]
 * 
 * Fetches or deletes a single resume.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import { deleteResume as deleteFromStorage } from '@/lib/storage';

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

/**
 * DELETE /api/resumes/[id]
 * 
 * Deletes a resume from the database and storage.
 */
export async function DELETE(
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

        // Find resume first to get storage path
        const resume = await Resume.findOne({ _id: id, userId });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Delete from Supabase Storage if it has a storage path
        if (resume.storagePath && resume.source === 'upload') {
            try {
                await deleteFromStorage(resume.storagePath);
                console.log(`[Resume DELETE] Deleted from storage: ${resume.storagePath}`);
            } catch (storageErr) {
                console.warn(`[Resume DELETE] Storage deletion failed (non-fatal): ${storageErr}`);
                // Continue with database deletion even if storage fails
            }
        }

        // Delete from database
        await Resume.deleteOne({ _id: id, userId });

        console.log(`[Resume DELETE] Deleted resume: ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        console.error('[Resume DELETE] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

