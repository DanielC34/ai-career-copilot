/**
 * Type definitions for Resume uploads and Supabase Storage
 */

import { Types } from 'mongoose';

export type AllowedMime = 'application/pdf' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export type ResumeSource = 'upload' | 'manual' | 'template';
export type ResumeStatus = 'processing' | 'completed' | 'failed';

/**
 * Contact Information
 */
export interface ContactInfo {
    fullName: string;
    email: string;
    phone?: string;
    location?: string; // City, State or Country
    linkedin?: string;
    portfolio?: string;
    github?: string;
    website?: string;
}

/**
 * Work Experience Entry
 */
export interface WorkExperience {
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string; // e.g., "Jan 2020" or "2020-01"
    endDate?: string; // Empty if current position
    isCurrent: boolean;
    responsibilities: string[]; // Bullet points
    achievements?: string[]; // Notable achievements
}

/**
 * Education Entry
 */
export interface Education {
    degree: string; // e.g., "Bachelor of Science in Computer Science"
    institution: string;
    location?: string;
    graduationDate?: string; // e.g., "May 2020"
    gpa?: string;
    honors?: string[]; // Dean's List, Cum Laude, etc.
    relevantCoursework?: string[];
}

/**
 * Skill Category
 */
export interface SkillCategory {
    category: string; // e.g., "Programming Languages", "Frameworks", "Soft Skills"
    skills: string[];
}

/**
 * Project Entry
 */
export interface Project {
    title: string;
    description: string;
    technologies?: string[];
    link?: string; // GitHub, live demo, etc.
    highlights?: string[]; // Key achievements or features
}

/**
 * Certification
 */
export interface Certification {
    name: string;
    issuer: string;
    date?: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

/**
 * Language Proficiency
 */
export interface Language {
    language: string;
    proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

/**
 * Complete Structured Resume Data
 */
export interface ResumeStructuredData {
    contact: ContactInfo;
    summary?: string; // Professional summary/objective
    experience: WorkExperience[];
    education: Education[];
    skills: SkillCategory[];
    projects?: Project[];
    certifications?: Certification[];
    languages?: Language[];
    awards?: string[];
    publications?: string[];
    volunteerWork?: string[];
}

/**
 * ATS Template Types
 */
export type ATSTemplateId = 'modern-clean' | 'professional-classic' | 'executive' | 'technical' | 'simple-ats';

export interface ATSTemplate {
    id: ATSTemplateId;
    name: string;
    description: string;
    previewImage?: string;
    features: string[];
    bestFor: string; // e.g., "Software Engineers", "Executives", "General Use"
}

/**
 * Resume Metadata (extended with structured data)
 */
export interface ResumeMeta {
    _id?: string;
    userId: Types.ObjectId | string;
    fileName: string;
    source: ResumeSource;
    storagePath?: string; // Required only for source: upload
    publicUrl?: string;
    size: number;
    mimeType?: AllowedMime; // Required only for source: upload
    uploadedAt: Date;
    processed: boolean;

    // New structured data fields
    structuredData?: ResumeStructuredData | null;
    analysis?: ATSAnalysis | null;
    atsScore?: number; // 0-100, ATS compatibility score
    rawText?: string; // Extracted raw text for generation
    lastEditedAt?: Date;
    selectedTemplate?: ATSTemplateId;
    status: ResumeStatus;
}

/**
 * Upload Response
 */
export interface UploadResponse {
    success: boolean;
    resumeId?: string;
    url?: string;
    error?: string;
}

/**
 * ATS PDF Generation Request
 */
export interface ATSPdfRequest {
    resumeId: string;
    templateId: ATSTemplateId;
    customData?: Partial<ResumeStructuredData>; // Allow custom overrides
}

/**
 * ATS Analysis Result
 */
export interface ATSAnalysis {
    score: number; // 0-100
    issues: string[]; // List of ATS compatibility issues
    recommendations: string[]; // Suggestions to improve ATS score
    missingKeywords?: string[]; // Keywords that could be added
}
