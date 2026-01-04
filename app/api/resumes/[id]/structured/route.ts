/**
 * API Route: Get/Update Structured Resume Data
 * 
 * GET: Fetch structured resume data for editing
 * PUT: Update structured resume data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume, { ResumeDocument } from '@/models/Resume';

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
        await connectToDatabase();

        const resume = await Resume.findOne<ResumeDocument>({
            _id: id,
            userId: session.user.id,
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        return NextResponse.json({
            structuredData: resume.structuredData,
            atsScore: resume.atsScore,
            selectedTemplate: resume.selectedTemplate,
            fileName: resume.fileName,
            processed: resume.processed,
        });
    } catch (error) {
        console.error('Error fetching structured resume data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { structuredData, selectedTemplate } = await request.json();

        await connectToDatabase();

        const resume = await Resume.findOne<ResumeDocument>({
            _id: id,
            userId: session.user.id,
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Update structured data and template selection
        if (structuredData) {
            resume.structuredData = structuredData;
            resume.lastEditedAt = new Date();
        }

        if (selectedTemplate) {
            resume.selectedTemplate = selectedTemplate;
        }

        await resume.save();

        return NextResponse.json({
            success: true,
            structuredData: resume.structuredData,
            selectedTemplate: resume.selectedTemplate,
            atsScore: resume.atsScore,
        });
    } catch (error) {
        console.error('Error updating structured resume data:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
