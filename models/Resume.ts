import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ResumeMeta, AllowedMime } from '@/types/resume';

export interface ResumeDocument extends Omit<ResumeMeta, '_id'>, Document {
    _id: mongoose.Types.ObjectId;
}

const ResumeSchema = new Schema<ResumeDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster lookups by user
    },
    source: {
        type: String,
        required: true,
        enum: ['upload', 'manual', 'template'],
    },
    fileName: {
        type: String,
        required: true,
    },
    storagePath: {
        type: String,
        required: false, // Only required for source: upload
        sparse: true, // Allow multiple nulls despite unique index if needed (though we handle uniqueness manually)
        unique: true,
    },
    publicUrl: {
        type: String,
        default: null,
    },
    size: {
        type: Number,
        required: true,
    },
    mimeType: {
        type: String,
        required: false, // Only required for source: upload
        enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as AllowedMime[],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    processed: {
        type: Boolean,
        default: false, // Flag to track if AI extraction has been done
    },
    // New fields for ATS functionality
    structuredData: {
        type: Schema.Types.Mixed, // Stores ResumeStructuredData as JSON
        default: null,
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null, // ATS compatibility score (0-100)
    },
    analysis: {
        type: Schema.Types.Mixed,
        default: null,
    },
    rawText: {
        type: String,
        default: null,
    },
    lastEditedAt: {
        type: Date,
        default: null, // Track when user last edited the structured data
    },
    selectedTemplate: {
        type: String,
        enum: ['modern-clean', 'professional-classic', 'executive', 'technical', 'simple-ats'],
        default: 'modern-clean', // Default ATS template
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing',
    },
});

// Create compound index for efficient querying
ResumeSchema.index({ userId: 1, uploadedAt: -1 });

export const Resume: Model<ResumeDocument> =
    mongoose.models.Resume || mongoose.model<ResumeDocument>('Resume', ResumeSchema);

export default Resume;
