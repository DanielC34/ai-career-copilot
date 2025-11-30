import mongoose, { Schema, model, models } from 'mongoose';

const ApplicationSchema = new Schema({
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

const Application = models.Application || model('Application', ApplicationSchema);

export default Application;
