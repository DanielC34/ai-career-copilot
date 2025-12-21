/**
 * Resume Raw Text Parser
 * 
 * Responsibility: Convert binary file buffers into plain text strings.
 * Supported Formats: PDF, DOCX, DOC.
 */

import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
// Handle both v1 (function) and v2 (object with PDFParse)
const pdf = typeof pdfParse === 'function' ? pdfParse : pdfParse.PDFParse;

/**
 * Extracts raw text from a document buffer based on its MIME type.
 * 
 * @param buffer - The binary content of the file
 * @param mimeType - The file's MIME type
 * @returns Promise<string> - The extracted raw text
 */
export async function extractRawText(
    buffer: Buffer,
    mimeType: string
): Promise<string> {
    console.log('[Parser] Extracting raw text from:', mimeType);

    try {
        if (mimeType === 'application/pdf') {
            const data = await pdf(buffer);
            return data.text || '';
        }

        if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value || '';
        }

        throw new Error(`Unsupported MIME type for text extraction: ${mimeType}`);
    } catch (error) {
        console.error('[Parser] Raw extraction failed:', error);
        throw new Error('Could not extract text from the provided resume file.');
    }
}
