/**
 * ATS Template Registry
 * 
 * Central registry for all ATS-friendly resume templates.
 * Each template is designed for maximum ATS compatibility while maintaining visual appeal.
 */

import type { ATSTemplate } from '@/types/resume';

// Import template configurations
import { modernCleanTemplate } from './modern-clean';
import { professionalClassicTemplate } from './professional-classic';
import { executiveTemplate } from './executive';
import { technicalTemplate } from './technical';
import { simpleATSTemplate } from './simple-ats';

/**
 * All available ATS templates
 */
export const ATS_TEMPLATES: ATSTemplate[] = [
    modernCleanTemplate,
    professionalClassicTemplate,
    executiveTemplate,
    technicalTemplate,
    simpleATSTemplate,
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ATSTemplate | undefined {
    return ATS_TEMPLATES.find(template => template.id === id);
}

/**
 * Get default template
 */
export function getDefaultTemplate(): ATSTemplate {
    return modernCleanTemplate;
}
