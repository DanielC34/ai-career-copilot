import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ApplicationDocument extends Document {
    userId: mongoose.Types.ObjectId;
    jobTitle: string;
    companyName: string;
    originalCV: string;
    jobDescription: string;
    status: 'draft' | 'generated' | 'failed';
    generatedContent?: {
        rewrittenCV?: string;
        coverLetter?: string;
        skillsMatch?: string[];
        skillsGap?: string[];
        interviewQuestions?: string[];
        summary?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new Schema<ApplicationDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobTitle: {
        type: String,
        default: 'Untitled Application',
    },
    companyName: {
        type: String,
        default: 'Unknown Company',
    },
    originalCV: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'generated', 'failed'],
        default: 'draft',
    },
    generatedContent: {
        rewrittenCV: String,
        coverLetter: String,
        skillsMatch: [String],
        skillsGap: [String],
        interviewQuestions: [String],
        summary: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update updatedAt on save
ApplicationSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export const Application: Model<ApplicationDocument> =
    mongoose.models.Application || mongoose.model<ApplicationDocument>('Application', ApplicationSchema);

export default Application;
