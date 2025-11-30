import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET() {
    try {
        console.log('Testing DB connection...');
        await connectToDatabase();
        console.log('DB Connected successfully');
        return NextResponse.json({ status: 'success', message: 'Database connected successfully' });
    } catch (error) {
        console.error('DB Connection failed:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
