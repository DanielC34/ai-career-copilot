import { NextResponse } from 'next/server';
import { supabaseServiceClient, STORAGE_BUCKET } from '@/lib/supabase';

export async function GET() {
    if (!supabaseServiceClient) {
        return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 });
    }

    try {
        console.log(`Checking bucket: ${STORAGE_BUCKET}`);

        // 1. List buckets to see if it exists
        const { data: buckets, error: listError } = await supabaseServiceClient.storage.listBuckets();

        if (listError) {
            return NextResponse.json({ error: `Failed to list buckets: ${listError.message}` }, { status: 500 });
        }

        const bucketExists = buckets.find(b => b.name === STORAGE_BUCKET);

        if (bucketExists) {
            return NextResponse.json({
                message: `Bucket '${STORAGE_BUCKET}' already exists.`,
                bucket: bucketExists
            });
        }

        // 2. Create bucket if it doesn't exist
        console.log(`Creating bucket: ${STORAGE_BUCKET}`);
        const { data: newBucket, error: createError } = await supabaseServiceClient.storage.createBucket(STORAGE_BUCKET, {
            public: true, // Make it public so we can download/view files easily
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
        });

        if (createError) {
            return NextResponse.json({ error: `Failed to create bucket: ${createError.message}` }, { status: 500 });
        }

        return NextResponse.json({
            message: `Successfully created bucket '${STORAGE_BUCKET}'`,
            bucket: newBucket
        });

    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
