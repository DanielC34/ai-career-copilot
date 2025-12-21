/**
 * Simple ATS Template
 * 
 * Maximum ATS compatibility - pure text, no graphics, no tables.
 * Perfect for: Maximum ATS compatibility, conservative industries
 * ATS Score: 100/100
 */

import type { ATSTemplate } from '@/types/resume';

export const simpleATSTemplate: ATSTemplate = {
    id: 'simple-ats',
    name: 'Simple ATS',
    description: 'Maximum ATS compatibility with no-frills design',
    features: [
        '100% ATS-compatible formatting',
        'No graphics, no tables, no columns',
        'Pure text-based layout',
        'Standard fonts only',
        'Guaranteed to parse correctly in all ATS systems',
    ],
    bestFor: 'Maximum ATS compatibility - All industries',
};
