import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import { model } from '@/lib/gemini';
import { z } from 'zod';

const generateSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId } = generateSchema.parse(body);

    await connectToDatabase();

    // Fetch the application
    const application = await Application.findOne({
      _id: applicationId,
      // @ts-expect-error - session.user.id is added in auth.ts
      userId: session.user.id,
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Construct the prompt
    const prompt = `
      You are an expert career coach and professional resume writer.
      
      I need you to generate tailored job application materials based on the following:
      
      ORIGINAL CV:
      ${application.originalCV}
      
      JOB DESCRIPTION:
      ${application.jobDescription}
      
      Please provide the output in strict JSON format with the following structure:
      {
        "rewrittenCV": "The full text of the rewritten CV, optimized for the job description.",
        "coverLetter": "A professional cover letter tailored to the company and role.",
        "skillsMatch": ["List of matching skills found in the CV"],
        "skillsGap": ["List of skills required by the job but missing in the CV"],
        "interviewQuestions": ["5 potential interview questions based on the role and CV"],
        "summary": "A brief summary of why the candidate is a good fit"
      }
    `;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text (remove markdown code blocks if present)
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json({ error: 'Failed to generate valid JSON content' }, { status: 500 });
    }

    // Update the application
    application.generatedContent = generatedContent;
    application.status = 'generated';
    await application.save();

    return NextResponse.json({ success: true, application });

  } catch (error) {
    console.error('Generation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
