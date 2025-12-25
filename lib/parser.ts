/**
 * Resume Raw Text Parser
 * 
 * Responsibility: Convert binary file buffers into plain text strings.
 * Supported Formats: PDF, DOCX, DOC.
 */

import mammoth from 'mammoth';
import { createRequire } from 'module';

// === CRITICAL POLYFILLS FOR PDF-PARSE IN NODE.JS ===
// These must be defined BEFORE requiring pdf-parse
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
// ===================================================

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
    mimeType: string,
    resumeId?: string
): Promise<string> {
    const timestamp = new Date().toISOString();
    const idTag = resumeId ? `[${resumeId}]` : '';
    console.log(`[PARSER][${timestamp}]${idTag} Extraction start:`, {
        mimeType,
        bufferLength: buffer.length,
        previewHex: buffer.slice(0, 10).toString('hex')
    });

    try {
        if (mimeType === 'application/pdf') {
            try {
                const data = await pdf(buffer);
                const text = data.text || '';
                console.log(`[PARSER][${timestamp}]${idTag} PDF extraction successful`, { textLength: text.length });
                return text;
            } catch (pdfErr: any) {
                console.error(`[PARSER][${timestamp}]${idTag} PDF library error:`, pdfErr);
                throw new Error(`PDF Parsing Error: ${pdfErr.message || 'Unknown library failure'}`);
            }
        }

        if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            try {
                const result = await mammoth.extractRawText({ buffer });
                console.log(`[PARSER][${timestamp}]${idTag} Word extraction successful`, { textLength: result.value?.length });
                return result.value || '';
            } catch (wordErr: any) {
                console.error(`[PARSER][${timestamp}]${idTag} Word library error:`, wordErr);
                throw new Error(`Word Parsing Error: ${wordErr.message || 'Unknown library failure'}`);
            }
        }

        throw new Error(`Unsupported MIME type for text extraction: ${mimeType}`);
    } catch (error: any) {
        console.error(`[PARSER][${timestamp}]${idTag} Raw extraction FAILED:`, error);
        throw error;
    }
}
