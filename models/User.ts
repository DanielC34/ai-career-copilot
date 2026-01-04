import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    createdAt: Date;
}

const UserSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
    },
    password: {
        type: String,
        required: false, // Optional because of Google Auth
        select: false, // Don't return password by default
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const User: Model<UserDocument> =
    mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;
