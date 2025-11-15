import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// NOTE: the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This integration uses OpenAI's API which requires OPENAI_API_KEY environment variable
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
})

export async function POST(request: NextRequest) {
  try {
    const { cv, jobDescription } = await request.json()

    // Validate inputs
    if (!cv || cv.trim().length < 100) {
      return NextResponse.json(
        { error: 'CV must be at least 100 characters long' },
        { status: 400 }
      )
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description must be at least 50 characters long' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Create the prompt for OpenAI
    const prompt = `You are an expert career coach and resume writer. Analyze the following CV and job description, then generate a comprehensive application package.

CV:
${cv}

Job Description:
${jobDescription}

Generate a JSON response with the following structure:
{
  "rewrittenCV": "A professionally rewritten CV tailored to this specific job, highlighting relevant experience and skills. Keep the original information but reframe it to match the job requirements.",
  "coverLetter": "A compelling cover letter (3-4 paragraphs) that demonstrates why the candidate is perfect for this role. Include specific examples from their CV.",
  "skillsMatch": ["List of 5-7 skills from the CV that match the job requirements"],
  "skillsGap": ["List of 3-5 skills mentioned in the job description that are missing or weak in the CV"],
  "interviewQuestions": ["Array of 5-7 likely interview questions based on the job requirements"],
  "summary": "A brief 2-3 paragraph summary of the candidate's fit for the role, highlighting key strengths and areas to emphasize in the interview"
}

Ensure all text is professional, specific, and actionable. The rewritten CV should be formatted clearly with proper sections.`

    // Call OpenAI API
    // Note: gpt-5 doesn't support temperature parameter
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach and resume writer. Always respond with valid JSON matching the requested structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 8192,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const generatedContent = JSON.parse(content)

    return NextResponse.json(generatedContent)
  } catch (error) {
    console.error('Error generating content:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
