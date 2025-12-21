/**
 * Scoring & Analysis Module
 * 
 * Responsibility: Deterministically evaluate structured resume data.
 * Constraints: No AI, no database, no file parsing. Pure functions only.
 */

import type { ResumeStructuredData, ATSAnalysis } from '@/types/resume';

/**
 * Perform a full ATS analysis on structured resume data.
 * 
 * @param data - The structured JSON representation of a resume
 * @returns ATSAnalysis - Score, issues, and recommendations
 */
export function analyzeResume(data: ResumeStructuredData): ATSAnalysis {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // 1. Contact Info Assessment (Max 20 points)
    let contactScore = 0;
    if (data.contact) {
        if (data.contact.fullName) contactScore += 5;
        if (data.contact.email) contactScore += 5;
        if (data.contact.phone) contactScore += 4;
        if (data.contact.location) contactScore += 3;
        if (data.contact.linkedin || data.contact.website || data.contact.github) contactScore += 3;

        if (!data.contact.phone) issues.push('Missing phone number in contact information.');
        if (!data.contact.linkedin) recommendations.push('Consider adding a LinkedIn profile for better visibility.');
    } else {
        issues.push('Missing basic contact information.');
    }
    score += contactScore;

    // 2. Professional Summary (Max 10 points)
    if (data.summary && data.summary.trim().length > 50) {
        score += 10;
    } else if (data.summary && data.summary.trim().length > 0) {
        score += 5;
        recommendations.push('Your professional summary is a bit short. Aim for 2-3 impactful sentences.');
    } else {
        issues.push('Missing professional summary or objective.');
        recommendations.push('Add a brief career summary to highlight your key value proposition.');
    }

    // 3. Work Experience (Max 35 points)
    if (data.experience && data.experience.length > 0) {
        score += 10; // Base score for having experience

        // Depth of description
        const totalResponsibilities = data.experience.reduce((acc, exp) =>
            acc + (exp.responsibilities?.length || 0), 0);

        if (totalResponsibilities >= 10) {
            score += 15;
        } else if (totalResponsibilities >= 5) {
            score += 10;
            recommendations.push('Add more detail to your work responsibilities using bullet points.');
        } else {
            score += 5;
            issues.push('Work experience descriptions are too brief.');
        }

        // Recent experience check
        const hasCurrent = data.experience.some(exp => exp.isCurrent);
        if (hasCurrent) score += 10;
        else issues.push('No current position listed in work history.');

    } else {
        issues.push('No professional experience listed.');
        recommendations.push('If you are a student, include internships, volunteer roles, or key projects.');
    }

    // 4. Education (Max 15 points)
    if (data.education && data.education.length > 0) {
        score += 10;
        if (data.education.some(edu => edu.degree && edu.institution)) score += 5;
    } else {
        issues.push('No education history found.');
        recommendations.push('Add your highest degree and the institution attended.');
    }

    // 5. Skills (Max 20 points)
    if (data.skills && data.skills.length > 0) {
        const totalSkills = data.skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);
        if (totalSkills >= 15) {
            score += 20;
        } else if (totalSkills >= 8) {
            score += 15;
            recommendations.push('Consider listing more technical or soft skills relevant to your industry.');
        } else {
            score += 10;
            issues.push('Very few skills listed.');
        }
    } else {
        issues.push('No skills section identified.');
        recommendations.push('Create a dedicated skills section to help ATS scanners find keywords.');
    }

    // Final Normalization
    return {
        score: Math.min(Math.max(score, 0), 100),
        issues,
        recommendations
    };
}
