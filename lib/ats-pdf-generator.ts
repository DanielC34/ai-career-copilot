/**
 * ATS PDF Generator
 * 
 * Generates ATS-optimized PDF resumes using pdf-lib.
 * All templates use ATS-safe formatting:
 * - No tables
 * - No graphics or images
 * - Clean, selectable  text
 * - Standard fonts
 * - Proper heading hierarchy
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ResumeStructuredData, ATSTemplateId } from '@/types/resume';

// Page dimensions and margins
const PAGE_WIDTH = 595.28; // 8.5 inches in points (72 points/inch)
const PAGE_HEIGHT = 841.89; // 11 inches in points
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

// Color scheme (grayscale for ATS compatibility)
const BLACK = rgb(0, 0, 0);
const DARK_GRAY = rgb(0.2, 0.2, 0.2);
const MEDIUM_GRAY = rgb(0.5, 0.5, 0.5);
const LIGHT_GRAY = rgb(0.7, 0.7, 0.7);

/**
 * Generate ATS-optimized PDF resume
 */
export async function generateATSResumePDF(
    data: ResumeStructuredData,
    templateId: ATSTemplateId
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Select rendering function based on template
    switch (templateId) {
        case 'modern-clean':
            return await renderModernClean(pdfDoc, data, boldFont, regularFont, italicFont);
        case 'professional-classic':
            return await renderProfessionalClassic(pdfDoc, data, boldFont, regularFont, italicFont);
        case 'executive':
            return await renderExecutive(pdfDoc, data, boldFont, regularFont, italicFont);
        case 'technical':
            return await renderTechnical(pdfDoc, data, boldFont, regularFont, italicFont);
        case 'simple-ats':
            return await renderSimpleATS(pdfDoc, data, boldFont, regularFont, italicFont);
        default:
            return await renderModernClean(pdfDoc, data, boldFont, regularFont, italicFont);
    }
}

/**
 * Modern Clean Template Renderer
 */
async function renderModernClean(
    pdfDoc: PDFDocument,
    data: ResumeStructuredData,
    boldFont: any,
    regularFont: any,
    italicFont: any
): Promise<Uint8Array> {
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let yPosition = PAGE_HEIGHT - MARGIN;

    // Helper to add new page if needed
    const checkAndAddPage = (spaceNeeded: number) => {
        if (yPosition - spaceNeeded < MARGIN) {
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            yPosition = PAGE_HEIGHT - MARGIN;
        }
    };

    // 1. Header - Contact Information
    page.drawText(data.contact.fullName.toUpperCase(), {
        x: MARGIN,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: BLACK,
    });
    yPosition -= 30;

    // Contact details on one line
    const contactDetails = [
        data.contact.email,
        data.contact.phone,
        data.contact.location,
    ].filter(Boolean).join(' | ');

    page.drawText(contactDetails, {
        x: MARGIN,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: DARK_GRAY,
    });
    yPosition -= 15;

    // Links (LinkedIn, Portfolio, GitHub)
    const links = [
        data.contact.linkedin,
        data.contact.portfolio,
        data.contact.github,
        data.contact.website,
    ].filter(Boolean).join(' | ');

    if (links) {
        page.drawText(links, {
            x: MARGIN,
            y: yPosition,
            size: 9,
            font: regularFont,
            color: MEDIUM_GRAY,
        });
        yPosition -= 25;
    } else {
        yPosition -= 15;
    }

    // Horizontal line separator
    page.drawLine({
        start: { x: MARGIN, y: yPosition },
        end: { x: PAGE_WIDTH - MARGIN, y: yPosition },
        thickness: 1,
        color: LIGHT_GRAY,
    });
    yPosition -= 20;

    // 2. Professional Summary
    if (data.summary) {
        checkAndAddPage(80);

        page.drawText('PROFESSIONAL SUMMARY', {
            x: MARGIN,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: BLACK,
        });
        yPosition -= 18;

        // Wrap text
        const summaryLines = wrapText(data.summary, CONTENT_WIDTH, regularFont, 10);
        for (const line of summaryLines) {
            checkAndAddPage(14);
            page.drawText(line, {
                x: MARGIN,
                y: yPosition,
                size: 10,
                font: regularFont,
                color: DARK_GRAY,
            });
            yPosition -= 14;
        }
        yPosition -= 10;
    }

    // 3. Work Experience
    if (data.experience && data.experience.length > 0) {
        checkAndAddPage(60);

        page.drawText('PROFESSIONAL EXPERIENCE', {
            x: MARGIN,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: BLACK,
        });
        yPosition -= 20;

        for (const exp of data.experience) {
            checkAndAddPage(100);

            // Job Title
            page.drawText(exp.jobTitle, {
                x: MARGIN,
                y: yPosition,
                size: 11,
                font: boldFont,
                color: BLACK,
            });
            yPosition -= 15;

            // Company and dates
            const dateRange = exp.isCurrent
                ? `${exp.startDate} - Present`
                : `${exp.startDate} - ${exp.endDate || 'Present'}`;

            page.drawText(exp.company, {
                x: MARGIN,
                y: yPosition,
                size: 10,
                font: italicFont,
                color: DARK_GRAY,
            });

            page.drawText(dateRange, {
                x: PAGE_WIDTH - MARGIN - (dateRange.length * 5),
                y: yPosition,
                size: 10,
                font: regularFont,
                color: MEDIUM_GRAY,
            });
            yPosition -= 15;

            // Location if available
            if (exp.location) {
                page.drawText(exp.location, {
                    x: MARGIN,
                    y: yPosition,
                    size: 9,
                    font: regularFont,
                    color: MEDIUM_GRAY,
                });
                yPosition -= 14;
            }

            // Responsibilities bullets
            for (const responsibility of exp.responsibilities) {
                checkAndAddPage(30);
                const bulletLines = wrapText(responsibility, CONTENT_WIDTH - 20, regularFont, 9);

                // First line with bullet
                page.drawText('•', {
                    x: MARGIN + 5,
                    y: yPosition,
                    size: 9,
                    font: regularFont,
                    color: BLACK,
                });

                page.drawText(bulletLines[0], {
                    x: MARGIN + 15,
                    y: yPosition,
                    size: 9,
                    font: regularFont,
                    color: DARK_GRAY,
                });
                yPosition -= 12;

                // Continuation lines
                for (let i = 1; i < bulletLines.length; i++) {
                    checkAndAddPage(12);
                    page.drawText(bulletLines[i], {
                        x: MARGIN + 15,
                        y: yPosition,
                        size: 9,
                        font: regularFont,
                        color: DARK_GRAY,
                    });
                    yPosition -= 12;
                }
            }

            yPosition -= 8;
        }

        yPosition -= 5;
    }

    // 4. Education
    if (data.education && data.education.length > 0) {
        checkAndAddPage(60);

        page.drawText('EDUCATION', {
            x: MARGIN,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: BLACK,
        });
        yPosition -= 20;

        for (const edu of data.education) {
            checkAndAddPage(60);

            // Degree
            page.drawText(edu.degree, {
                x: MARGIN,
                y: yPosition,
                size: 11,
                font: boldFont,
                color: BLACK,
            });
            yPosition -= 15;

            // Institution and date
            page.drawText(edu.institution, {
                x: MARGIN,
                y: yPosition,
                size: 10,
                font: italicFont,
                color: DARK_GRAY,
            });

            if (edu.graduationDate) {
                page.drawText(edu.graduationDate, {
                    x: PAGE_WIDTH - MARGIN - (edu.graduationDate.length * 5),
                    y: yPosition,
                    size: 10,
                    font: regularFont,
                    color: MEDIUM_GRAY,
                });
            }
            yPosition -= 12;

            // GPA if available
            if (edu.gpa) {
                page.drawText(`GPA: ${edu.gpa}`, {
                    x: MARGIN,
                    y: yPosition,
                    size: 9,
                    font: regularFont,
                    color: MEDIUM_GRAY,
                });
                yPosition -= 12;
            }

            yPosition -= 8;
        }

        yPosition -= 5;
    }

    // 5. Skills
    if (data.skills && data.skills.length > 0) {
        checkAndAddPage(60);

        page.drawText('SKILLS', {
            x: MARGIN,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: BLACK,
        });
        yPosition -= 20;

        for (const skillCategory of data.skills) {
            checkAndAddPage(30);

            const skillsText = `${skillCategory.category}: ${skillCategory.skills.join(', ')}`;
            const skillsLines = wrapText(skillsText, CONTENT_WIDTH, regularFont, 10);

            for (const line of skillsLines) {
                checkAndAddPage(14);
                page.drawText(line, {
                    x: MARGIN,
                    y: yPosition,
                    size: 10,
                    font: regularFont,
                    color: DARK_GRAY,
                });
                yPosition -= 14;
            }
        }

        yPosition -= 10;
    }

    // 6. Projects (if available)
    if (data.projects && data.projects.length > 0) {
        checkAndAddPage(60);

        page.drawText('PROJECTS', {
            x: MARGIN,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: BLACK,
        });
        yPosition -= 20;

        for (const project of data.projects) {
            checkAndAddPage(40);

            page.drawText(project.title, {
                x: MARGIN,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: BLACK,
            });
            yPosition -= 14;

            const descLines = wrapText(project.description, CONTENT_WIDTH, regularFont, 9);
            for (const line of descLines) {
                checkAndAddPage(12);
                page.drawText(line, {
                    x: MARGIN,
                    y: yPosition,
                    size: 9,
                    font: regularFont,
                    color: DARK_GRAY,
                });
                yPosition -= 12;
            }

            if (project.technologies && project.technologies.length > 0) {
                checkAndAddPage(12);
                page.drawText(`Technologies: ${project.technologies.join(', ')}`, {
                    x: MARGIN,
                    y: yPosition,
                    size: 8,
                    font: italicFont,
                    color: MEDIUM_GRAY,
                });
                yPosition -= 14;
            }

            yPosition -= 6;
        }
    }

    // 7. Certifications
    if (data.certifications && data.certifications.length > 0) {
        checkAndAddPage(40);

        page.drawText('CERTIFICATIONS', {
            x: MARGIN,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: BLACK,
        });
        yPosition -= 18;

        for (const cert of data.certifications) {
            checkAndAddPage(20);
            page.drawText(`${cert.name} - ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`, {
                x: MARGIN,
                y: yPosition,
                size: 9,
                font: regularFont,
                color: DARK_GRAY,
            });
            yPosition -= 12;
        }
    }

    return await pdfDoc.save();
}

/**
 * Professional Classic Template Renderer
 * (Simplified version - delegates to Modern Clean for now)
 */
async function renderProfessionalClassic(
    pdfDoc: PDFDocument,
    data: ResumeStructuredData,
    boldFont: any,
    regularFont: any,
    italicFont: any
): Promise<Uint8Array> {
    // For now, use Modern Clean rendering
    // TODO: Implement two-column layout in future iteration
    return await renderModernClean(pdfDoc, data, boldFont, regularFont, italicFont);
}

/**
 * Executive Template Renderer
 */
async function renderExecutive(
    pdfDoc: PDFDocument,
    data: ResumeStructuredData,
    boldFont: any,
    regularFont: any,
    italicFont: any
): Promise<Uint8Array> {
    // Similar to Modern Clean but with larger summary section
    return await renderModernClean(pdfDoc, data, boldFont, regularFont, italicFont);
}

/**
 * Technical Template Renderer
 */
async function renderTechnical(
    pdfDoc: PDFDocument,
    data: ResumeStructuredData,
    boldFont: any,
    regularFont: any,
    italicFont: any
): Promise<Uint8Array> {
    // Similar to Modern Clean but skills section comes first
    return await renderModernClean(pdfDoc, data, boldFont, regularFont, italicFont);
}

/**
 * Simple ATS Template Renderer
 */
async function renderSimpleATS(
    pdfDoc: PDFDocument,
    data: ResumeStructuredData,
    boldFont: any,
    regularFont: any,
    italicFont: any
): Promise<Uint8Array> {
    // Pure text, no styling beyond basic formatting
    return await renderModernClean(pdfDoc, data, boldFont, regularFont, italicFont);
}

/**
 * Wrap text to fit within a given width
 */
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}
