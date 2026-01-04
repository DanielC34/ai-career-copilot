/**
 * API Route: Generate ATS PDF
 * 
 * POST: Generate ATS-optimized PDF from structured resume data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume, { ResumeDocument } from '@/models/Resume';
import { generateATSResumePDF } from '@/lib/ats-pdf-generator';
import type { ATSTemplateId } from '@/types/resume';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const templateId: ATSTemplateId = body.templateId || 'modern-clean';

        await connectToDatabase();

        const resume = await Resume.findOne<ResumeDocument>({
            _id: id,
            userId: session.user.id,
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        if (!resume.structuredData) {
            return NextResponse.json(
                { error: 'Resume has not been processed yet. Please extract text first.' },
                { status: 400 }
            );
        }

        // Generate PDF
        const pdfBytes = await generateATSResumePDF(resume.structuredData, templateId);

        // Create response with PDF
        return new NextResponse(pdfBytes as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Resume_${resume.structuredData.contact?.fullName || 'ATS'}.pdf"`,
                'Content-Length': pdfBytes.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating ATS PDF:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
