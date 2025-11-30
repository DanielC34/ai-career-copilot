import jsPDF from 'jspdf';

interface GeneratedContent {
    rewrittenCV?: string;
    coverLetter?: string;
    skillsMatch?: string[];
    skillsGap?: string[];
    interviewQuestions?: string[];
    summary?: string;
}

/**
 * Export CV as PDF
 */
export function exportCVAsPDF(cv: string, jobTitle: string, companyName: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Tailored Resume', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${jobTitle} at ${companyName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add CV content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(cv, maxWidth);

    lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
    });

    // Download
    const fileName = `CV_${jobTitle.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

/**
 * Export Cover Letter as PDF
 */
export function exportCoverLetterAsPDF(coverLetter: string, jobTitle: string, companyName: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Cover Letter', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${jobTitle} at ${companyName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add cover letter content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(coverLetter, maxWidth);

    lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
    });

    // Download
    const fileName = `CoverLetter_${jobTitle.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

/**
 * Export Complete Application Package (CV + Cover Letter + Analysis)
 */
export function exportCompletePackageAsPDF(
    content: GeneratedContent,
    jobTitle: string,
    companyName: string
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);

        lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += fontSize * 0.5;
        });
        yPosition += 5;
    };

    const addSection = (title: string, content: string) => {
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin;
        }
        addText(title, 14, true);
        addText(content);
        yPosition += 5;
    };

    // Cover page
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Application Package', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(jobTitle, pageWidth / 2, pageHeight / 2, { align: 'center' });
    doc.text(companyName, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });

    // New page for CV
    doc.addPage();
    yPosition = margin;

    if (content.rewrittenCV) {
        addSection('TAILORED RESUME', content.rewrittenCV);
    }

    // New page for Cover Letter
    if (content.coverLetter) {
        doc.addPage();
        yPosition = margin;
        addSection('COVER LETTER', content.coverLetter);
    }

    // New page for Analysis
    doc.addPage();
    yPosition = margin;

    if (content.summary) {
        addSection('APPLICATION SUMMARY', content.summary);
    }

    if (content.skillsMatch && content.skillsMatch.length > 0) {
        addSection('MATCHING SKILLS', content.skillsMatch.join(', '));
    }

    if (content.skillsGap && content.skillsGap.length > 0) {
        addSection('SKILLS TO HIGHLIGHT', content.skillsGap.join(', '));
    }

    if (content.interviewQuestions && content.interviewQuestions.length > 0) {
        addText('INTERVIEW PREPARATION', 14, true);
        content.interviewQuestions.forEach((question, index) => {
            addText(`${index + 1}. ${question}`, 10);
        });
    }

    // Download
    const fileName = `Application_Package_${jobTitle.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}
