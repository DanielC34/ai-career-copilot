/**
 * Canonical Resume Intelligence Pipeline
 * 
 * POST /api/resumes/[id]/process
 * 
 * THIS IS THE SOLE INTELLIGENCE PIPELINE FOR RESUMES.
 * No resume (Upload, Manual, or Template) should bypass this route.
 * 
 * Orchestrates:
 * 1. Extraction (Conditional): Downloads and parses if rawText is missing.
 * 2. Structuring: AI-driven extraction of JSON data.
 * 3. Analysis: Deterministic ATS compatibility scoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { performance } from 'perf_hooks';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume, { ResumeDocument } from '@/models/Resume';
import { getResumeBuffer } from '@/lib/storage';
import { extractRawText } from '@/lib/parser';
import { structureResumeData } from '@/lib/ai-service';
import { analyzeResume } from '@/lib/scoring';


export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Parse body exactly once at the start
    const body = await request.json().catch(() => ({}));

    const isDebug = request.nextUrl.searchParams.get('DEBUG') === 'true' || process.env.DEBUG === 'true';
    const pipelineStart = performance.now();
    let stageName = 'Initialization';

    // Helper for structured logging with metrics
    const log = (message: string, duration?: number, data?: any) => {
        const timestamp = new Date().toISOString();
        const durationStr = duration !== undefined ? ` [${duration.toFixed(2)}ms]` : '';
        console.log(`[PROCESS][${timestamp}][${id}][${stageName}] ${message}${durationStr}`, isDebug && data ? data : '');
    };

    // Helper for AI retry logic
    const structureWithRetry = async (text: string, templateId?: string, retries = 3): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await structureResumeData(text, templateId);
            } catch (err) {
                if (attempt === retries) throw err;
                log(`AI attempt ${attempt} failed, retrying...`, undefined, err);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    };

    try {
        // 1. Authenticate
        stageName = 'Authentication';
        const authStart = performance.now();
        log('Authenticating user...');
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
                message: 'No active session found',
                stage: stageName
            }, { status: 401 });
        }
        const userId = session.user.id;
        log('Authentication successful', performance.now() - authStart);

        // 2. DB Connection
        stageName = 'DB Connection';
        const dbStart = performance.now();
        log('Connecting to database...');
        await connectToDatabase();
        log('Database connected', performance.now() - dbStart);

        // 3. Metadata Fetch
        stageName = 'Metadata Fetch';
        const metaStart = performance.now();
        const resume = await Resume.findOne<ResumeDocument>({ _id: id, userId });
        if (!resume) {
            return NextResponse.json({
                success: false,
                error: 'Resume not found',
                message: `No resume record found for ID: ${id}`,
                stage: stageName
            }, { status: 404 });
        }
        log('Metadata retrieved', performance.now() - metaStart, { source: resume.source });

        try {
            resume.status = 'processing';
            await resume.save();

            // === START NEW WORKFLOW ===

            // 4. Conversion Stage (.txt conversion & persistence)
            let rawText = resume.rawText;
            if (!rawText) {
                stageName = 'Conversion';
                const convStart = performance.now();
                log('Starting Conversion stage...', undefined, { path: resume.storagePath });

                if (!resume.storagePath) {
                    throw new Error('Resume is missing both rawText and storagePath');
                }

                const buffer = await getResumeBuffer(resume.storagePath);
                if (!buffer || buffer.length === 0) {
                    throw new Error('Retrieved file buffer is empty or missing');
                }

                log('File downloaded for conversion', undefined, { size: buffer.length });

                try {
                    rawText = await extractRawText(buffer, resume.mimeType || 'application/pdf', id);
                    if (!rawText || rawText.trim().length === 0) {
                        throw new Error('No text could be extracted from the file');
                    }

                    // Persist the extracted text immediately
                    resume.rawText = rawText;
                    await resume.save();
                    log('Raw text extracted and persisted', performance.now() - convStart, { length: rawText.length });
                } catch (err: any) {
                    log('Conversion FAILED', undefined, err);
                    return NextResponse.json({
                        success: false,
                        error: 'Raw Text Extraction Failed',
                        message: err.message || 'Unknown extraction error',
                        stage: stageName,
                        resumeId: id
                    }, { status: 500 });
                }
            } else {
                log('Raw text already exists, skipping conversion.');
            }

            // 5. Template Retrieval Stage
            stageName = 'Template Retrieval';
            // Use the body data parsed at the start of the request
            const finalTemplateId = body.selectedTemplate || resume.selectedTemplate || 'modern-clean';
            log('Retrieving template info...', undefined, { templateId: finalTemplateId });

            // (Optional: validate template in registry if needed)
            resume.selectedTemplate = finalTemplateId;

            // 6. AI Structuring Stage
            stageName = 'AI Structuring';
            const aiStart = performance.now();
            log('Starting AI Structuring stage...', undefined, { templateId: finalTemplateId, inputLength: rawText.length });

            const structuredData = await structureWithRetry(rawText, finalTemplateId, 3); // Retries included in helper
            const aiDuration = performance.now() - aiStart;
            log('AI Structuring successful', aiDuration);

            // 7. Analysis Stage
            stageName = 'Analysis';
            const analysisStart = performance.now();
            log('Performing ATS analysis...');
            const analysis = analyzeResume(structuredData);
            log('Analysis complete', performance.now() - analysisStart, { score: analysis.score });

            // 8. Final Save Stage
            stageName = 'Final Save';
            const saveStart = performance.now();
            log('Saving final results...');
            resume.structuredData = structuredData;
            resume.analysis = analysis;
            resume.atsScore = analysis.score;
            resume.status = 'completed';
            resume.processed = true;
            await resume.save();
            log('Final save complete', performance.now() - saveStart);

            const totalDuration = performance.now() - pipelineStart;
            return NextResponse.json({
                success: true,
                resumeId: id,
                status: 'completed',
                atsScore: analysis.score,
                metrics: {
                    totalDuration: totalDuration.toFixed(2),
                    aiDuration: aiDuration.toFixed(2),
                    textLength: rawText.length
                }
            });

            /* === OLD WORKFLOW (COMMENTED OUT) ===
            let rawText = resume.rawText;

            // 4. Supabase Download & Extraction
            if (!rawText) {
                stageName = 'Supabase Download';
                const dlStart = performance.now();
                log('Downloading file from Supabase...', undefined, { path: resume.storagePath });

                if (!resume.storagePath) {
                    throw new Error('Resume is missing both rawText and storagePath');
                }

                const buffer = await getResumeBuffer(resume.storagePath);
                if (!buffer || buffer.length === 0) {
                    throw new Error(`Downloaded resume buffer is empty or invalid (Path: ${resume.storagePath})`);
                }
                log('Download complete', performance.now() - dlStart, { size: buffer.length });

                stageName = 'Raw Text Extraction';
                const extractStart = performance.now();
                log('Extracting raw text...', undefined, { mimeType: resume.mimeType, bufferLength: buffer.length });

                try {
                    rawText = await extractRawText(buffer, resume.mimeType, id);
                    if (!rawText || rawText.trim().length === 0) {
                        throw new Error('No readable text content found in document during extraction');
                    }
                } catch (extractionError: any) {
                    log('NESTED EXTRACTION FAILURE', undefined, extractionError);
                    return NextResponse.json({
                        success: false,
                        error: 'Raw Text Extraction failed',
                        message: extractionError instanceof Error ? extractionError.message : 'Unknown extraction error',
                        stage: stageName,
                        resumeId: id
                    }, { status: 500 });
                }

                const extractDuration = performance.now() - extractStart;
                log('Extraction successful', extractDuration, { textLength: rawText.length });

                resume.rawText = rawText;
            } else {
                log('Raw text provided directly, skipping download/extraction.');
            }

            // 5. AI Structuring
            stageName = 'AI Structuring';
            const aiStart = performance.now();
            log('Calling Gemini AI for structuring...', undefined, { inputLength: rawText.length });

            const structuredData = await structureWithRetry(rawText);
            const aiDuration = performance.now() - aiStart;
            const structuredDataStr = JSON.stringify(structuredData);
            log('AI structuring successful', aiDuration, { outputLength: structuredDataStr.length });

            // 6. ATS Analysis
            stageName = 'ATS Analysis';
            const analysisStart = performance.now();
            log('Analyzing resume for ATS scoring...');
            const analysis = analyzeResume(structuredData);
            log('Analysis complete', performance.now() - analysisStart, { score: analysis.score });

            // 7. Database Save
            stageName = 'Database Save';
            const saveStart = performance.now();
            log('Saving results to database...');
            resume.structuredData = structuredData;
            resume.analysis = analysis;
            resume.atsScore = analysis.score;
            resume.status = 'completed';
            resume.processed = true;
            await resume.save();
            log('Results saved successfully', performance.now() - saveStart);

            const totalDuration = performance.now() - pipelineStart;
            log('Canonical pipeline completed successfully', totalDuration);

            return NextResponse.json({
                success: true,
                resumeId: resume._id.toString(),
                status: 'completed',
                atsScore: analysis.score,
                metrics: {
                    totalDuration: totalDuration.toFixed(2),
                    aiDuration: aiDuration.toFixed(2),
                    textLength: rawText.length
                }
            });
            === END OLD WORKFLOW === */

        } catch (pipelineError: any) {
            log(`Pipeline CRITICAL FAILURE at stage: ${stageName}`, undefined, pipelineError);

            try {
                resume.status = 'failed';
                await resume.save();
                log('Updated resume status to "failed"');
            } catch (dbError) {
                console.error('[PROCESS] Failed to update status to "failed":', dbError);
            }

            return NextResponse.json({
                success: false,
                error: `Processing failed at ${stageName}`,
                message: pipelineError instanceof Error ? pipelineError.message : 'Unknown error during pipeline',
                stage: stageName
            }, { status: 500 });
        }

    } catch (orchestrationError: any) {
        console.error(`[PROCESS][FATAL][${id}][${stageName}]`, orchestrationError);
        return NextResponse.json({
            success: false,
            error: 'Orchestration error',
            message: orchestrationError instanceof Error ? orchestrationError.message : 'Internal server error',
            stage: stageName
        }, { status: 500 });
    }
}
