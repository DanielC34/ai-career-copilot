/**
 * Resume Raw Text Parser
 * 
 * Responsibility: Convert binary file buffers into plain text strings.
 * Supported Formats: PDF, DOCX, DOC.
 */

import mammoth from 'mammoth';
import { createRequire } from 'module';

/**
 * Custom Error for Resume Parsing
 */
export class ResumeParserError extends Error {
    constructor(
        public code: string,
        message: string,
        public suggestion: string
    ) {
        super(message);
        this.name = 'ResumeParserError';
    }
}

/**
 * Ensures polyfills required by pdf-parse are present.
 * - DOMMatrix
 * - TextEncoder / TextDecoder
 */
function ensurePolyfills() {
    if (!global.DOMMatrix) {
        // @ts-ignore
        global.DOMMatrix = class DOMMatrix {
            constructor() { }
            static fromFloat32Array() { return new DOMMatrix(); }
            static fromFloat64Array() { return new DOMMatrix(); }
        };
    }

    if (!global.TextEncoder) {
        // @ts-ignore
        const { TextEncoder } = require('util');
        global.TextEncoder = TextEncoder;
    }

    if (!global.TextDecoder) {
        // @ts-ignore
        const { TextDecoder } = require('util');
        global.TextDecoder = TextDecoder;
    }
}

/**
 * Normalizes extracted text.
 * - Collapses excessive whitespace.
 * - Normalizes line breaks (max 2 consecutive).
 * - Removes control characters.
 * - Trims junk.
 */
function normalizeText(text: string): string {
    if (!text) return '';
    return text
        // Remove control characters (except newline, tab)
        .replace(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g, '')
        .replace(/\r\n/g, '\n')      // Normalize CRLF
        .replace(/\r/g, '\n')        // Normalize CR
        .replace(/[ \t]+/g, ' ')     // Collapse horizontal whitespace
        .replace(/\n\s*\n/g, '\n\n') // Max 2 newlines (paragraphs)
        .trim();
}

/**
 * Checks if a buffer has a PDF signature (%PDF-)
 */
function isPdfBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 5) return false;
    // Check for %PDF- at either start (0) or within first 1024 bytes (some PDFs have junk preambles)
    const header = buffer.slice(0, 1024).toString();
    return header.includes('%PDF-');
}

/**
 * Primary PDF Extractor using pdf-parse (Lazy Loaded)
 */
async function extractPdfPrimary(buffer: Buffer): Promise<string> {
    ensurePolyfills(); // Ensure globals exist before requiring
    const pdfParse = require('pdf-parse');

    // Handle both v1 (function) and v2 (object with PDFParse)
    const pdf = typeof pdfParse === 'function' ? pdfParse : pdfParse.PDFParse;
    const data = await pdf(buffer);
    return data.text || '';
}

/**
 * Fallback PDF Extractor using pdf2json (Lazy Loaded)
 */
async function extractPdfFallback(buffer: Buffer): Promise<string> {
    // Dynamic import to lazy-load the heavy library only when needed
    // @ts-ignore
    const { default: PDFParser } = await import('pdf2json');

    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // customized manual extraction
                let rawText = pdfParser.getRawTextContent();

                // If built-in extraction yields nothing, try manual page iteration
                if (!rawText || rawText.trim().length === 0) {
                    if (pdfData && pdfData.Pages) {
                        pdfData.Pages.forEach((page: any) => {
                            if (page.Texts) {
                                page.Texts.forEach((t: any) => {
                                    if (t.R) {
                                        t.R.forEach((r: any) => {
                                            rawText += decodeURIComponent(r.T) + " ";
                                        });
                                    }
                                });
                                rawText += "\n";
                            }
                        });
                    }
                }

                resolve(rawText);
            } catch (e) {
                resolve(""); // Resolve empty to handle in upper logic
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

/**
 * Extracts raw text from a document buffer based on MIME type or Content Inspection.
 */
export async function extractRawText(
    buffer: Buffer,
    mimeType: string,
    resumeId?: string
): Promise<string> {
    const timestamp = new Date().toISOString();
    const idTag = resumeId ? `[${resumeId}]` : '';
    console.log(`[PARSER][${timestamp}]${idTag} Extraction start. Buffer size: ${buffer.length}`);

    let rawText = '';
    let usedParser = 'None';

    try {
        // Detect PDF by MIME or Header
        const isPdf = mimeType === 'application/pdf' || isPdfBuffer(buffer);
        const isWord = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword';

        if (isPdf) {
            // === STRATEGY: Primary -> Fallback ===
            try {
                usedParser = 'Primary (pdf-parse)';
                rawText = await extractPdfPrimary(buffer);
            } catch (primaryErr: any) {
                console.warn(`[PARSER][${timestamp}]${idTag} [Primary] failed: ${primaryErr.message}. Switching to Fallback.`);

                try {
                    usedParser = 'Fallback (pdf2json)';
                    rawText = await extractPdfFallback(buffer);
                } catch (fallbackErr: any) {
                    throw new ResumeParserError(
                        'PDF_PARSE_FAILED',
                        `All PDF parsing strategies failed. Primary: ${primaryErr.message}. Fallback: ${fallbackErr.message}`,
                        'Ensure the file is a valid, non-corrupted PDF.'
                    );
                }
            }
        } else if (isWord) {
            try {
                usedParser = 'Mammoth (DOCX)';
                const result = await mammoth.extractRawText({ buffer });
                rawText = result.value || '';
            } catch (wordErr: any) {
                throw new ResumeParserError(
                    'WORD_PARSE_FAILED',
                    `Word Parsing Error: ${wordErr.message}`,
                    'Try saving the document as a standard .docx or .pdf file.'
                );
            }
        } else {
            throw new ResumeParserError(
                'UNSUPPORTED_FORMAT',
                `Unsupported file type: ${mimeType}`,
                'Please upload a PDF (.pdf) or Word document (.docx, .doc).'
            );
        }

        // Post-Processing: Normalization & Validation
        const normalized = normalizeText(rawText);

        console.log(`[PARSER][${timestamp}]${idTag} Extraction complete. Parser: ${usedParser}. Normalized Length: ${normalized.length}`);

        // Check for Scanned / Image-Only PDF
        if (normalized.length < 50) {
            if (isPdf) {
                throw new ResumeParserError(
                    'PDF_SCANNED_NO_TEXT',
                    'Extracted text is too short or empty. The PDF might be scanned or image-based.',
                    'Please upload a text-based PDF or use an OCR tool to convert your resume to text.'
                );
            } else {
                throw new ResumeParserError(
                    'TEXT_TOO_SHORT',
                    `Extracted text is too short (Length: ${normalized.length}).`,
                    'Please provide a resume with more substantial text content.'
                );
            }
        }

        return normalized;

    } catch (error: any) {
        console.error(`[PARSER][${timestamp}]${idTag} Extraction FAILED:`, error);
        // If it's already a structured error, rethrow it. Otherwise wrap it.
        if (error instanceof ResumeParserError) {
            throw error;
        }
        throw new Error(error.message || 'Unknown parsing error');
    }
}
