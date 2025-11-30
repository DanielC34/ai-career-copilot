import { supabaseServiceClient, STORAGE_BUCKET } from '../lib/supabase';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkBucket() {
    console.log(`Checking bucket: ${STORAGE_BUCKET}`);

    if (!supabaseServiceClient) {
        console.error('Supabase service client not initialized. Check environment variables.');
        return;
    }

    try {
        // Try to list files in the bucket (limit 1)
        const { data, error } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .list('', { limit: 1 });

        if (error) {
            console.error('Error accessing bucket:', error.message);
            if (error.message.includes('Bucket not found')) {
                console.error(`\n❌ Bucket "${STORAGE_BUCKET}" does not exist.`);
                console.error('Please create a public bucket named "resumes" (or your configured name) in your Supabase dashboard.');
            }
        } else {
            console.log(`\n✅ Bucket "${STORAGE_BUCKET}" exists and is accessible.`);
            console.log('Files found:', data.length);
        }

        // Also check if bucket is public (by trying to get a public URL)
        const { data: publicUrlData } = supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl('test.txt');

        console.log('\nPublic URL format:', publicUrlData.publicUrl);
        console.log('Note: Ensure the bucket is set to "Public" in Supabase settings for these URLs to work.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkBucket();
