/**
 * Canonical Resume Creation API Route
 * 
 * POST /api/resumes
 * 
 * This is the sole gateway for creating any resume entity in the system.
 * It enforces a strict contract between the creator (Frontend) and the processor (Backend).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import type { ResumeSource, AllowedMime } from '@/types/resume';

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { source, rawText, storagePath, mimeType, fileName, size } = body;

        // 2. Strict Contract Validation
        /**
         * CONTRACT RULES (MANDATORY):
         * source   rawText     storagePath     mimeType
         * upload   ❌ null     ✅ required     ✅ required
         * manual   ✅ required ❌ null         ❌ null
         * template ✅ required ❌ null         ❌ null
         */

        if (!source || !['upload', 'manual', 'template'].includes(source)) {
            return NextResponse.json({ error: 'Invalid or missing source type' }, { status: 400 });
        }

        if (source === 'upload') {
            if (rawText !== undefined && rawText !== null) {
                return NextResponse.json({ error: 'Source "upload" must not provide rawText' }, { status: 400 });
            }
            if (!storagePath) {
                return NextResponse.json({ error: 'Source "upload" requires storagePath' }, { status: 400 });
            }
            if (!mimeType) {
                return NextResponse.json({ error: 'Source "upload" requires mimeType' }, { status: 400 });
            }
        } else {
            // source: manual | template
            if (!rawText || rawText.length < 50) {
                return NextResponse.json({ error: `Source "${source}" requires rawText (min 50 chars)` }, { status: 400 });
            }
            if (storagePath) {
                return NextResponse.json({ error: `Source "${source}" must not provide storagePath` }, { status: 400 });
            }
            if (mimeType) {
                return NextResponse.json({ error: `Source "${source}" must not provide mimeType` }, { status: 400 });
            }
        }

        if (!fileName) {
            return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
        }

        // 3. Persist as Processing
        await connectToDatabase();

        const resume = await Resume.create({
            userId: session.user.id,
            source: source as ResumeSource,
            fileName,
            size: size || (rawText ? Buffer.byteLength(rawText) : 0),
            storagePath: storagePath || `manual_${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
            mimeType: (mimeType as AllowedMime) || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Default mime for manual/template
            rawText: rawText || null,
            status: 'processing', // MANDATORY: Always start in processing
            processed: false,
        });

        console.log(`[Resume API] Created ${source} resume: ${resume._id}`);

        // 4. Return Canonical Response
        return NextResponse.json({
            success: true,
            resumeId: resume._id.toString(),
            status: 'processing'
        }, { status: 201 });

    } catch (error) {
        console.error('[Resume Creation Error]:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/resumes
 * 
 * Lists all resumes for the authenticated user.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const resumes = await Resume.find({ userId: session.user.id })
            .sort({ uploadedAt: -1 })
            .select('fileName size mimeType uploadedAt publicUrl processed source status');

        return NextResponse.json({ resumes });
    } catch (error) {
        console.error('[Resume List Error]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
