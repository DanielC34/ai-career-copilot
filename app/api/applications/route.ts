import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import { z } from 'zod';

const createApplicationSchema = z.object({
    originalCV: z.string().min(100, 'CV must be at least 100 characters'),
    jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // @ts-expect-error - session.user.id is added in auth.ts
        const applications = await Application.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .select('jobTitle companyName status createdAt');

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    console.log('=== POST /api/applications called ===');
    try {
        const session = await auth();
        console.log('Session:', session ? 'exists' : 'null', session?.user?.email);
        if (!session?.user) {
            console.log('No session - returning 401');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Request body:', { cv: body.originalCV?.substring(0, 50), jd: body.jobDescription?.substring(0, 50) });
        const validatedData = createApplicationSchema.parse(body);
        console.log('Validation passed');

        await connectToDatabase();
        console.log('Database connected');

        const application = await Application.create({
            // @ts-expect-error - session.user.id is added in auth.ts
            userId: session.user.id,
            ...validatedData,
            // Simple heuristic to extract title/company if not provided
            // In a real app, we might use AI to extract this from the text
            jobTitle: validatedData.jobTitle || 'Untitled Application',
            companyName: validatedData.companyName || 'Unknown Company',
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error:', error.errors);
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }
        console.error('Error creating application:', error);
        // Log more details for debugging
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
