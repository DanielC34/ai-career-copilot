// Test Supabase Connection
// Run this with: npx tsx scripts/test-supabase.ts

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('=== Supabase Configuration Test ===\n');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'resumes';

console.log('1. Environment Variables:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓ Set (length: ' + supabaseServiceKey.length + ')' : '✗ Missing');
console.log('   SUPABASE_BUCKET:', bucketName);
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env.local file.');
    process.exit(1);
}

// Test URL format
console.log('2. URL Validation:');
try {
    const url = new URL(supabaseUrl);
    console.log('   Valid URL ✓');
    console.log('   Protocol:', url.protocol);
    console.log('   Host:', url.host);
} catch (e) {
    console.error('   ✗ Invalid URL format:', e);
}
console.log('');

// Create client
console.log('3. Creating Supabase Client...');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
console.log('   Client created ✓');
console.log('');

// Test connection by listing buckets
console.log('4. Testing Connection (List Buckets)...');
try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('   ✗ Error listing buckets:', error.message);
        console.error('   Error details:', error);
    } else {
        console.log('   ✓ Successfully connected to Supabase!');
        console.log('   Found', buckets.length, 'bucket(s):');
        buckets.forEach(bucket => {
            console.log('   -', bucket.name, bucket.public ? '(public)' : '(private)');
        });

        // Check if our bucket exists
        const ourBucket = buckets.find(b => b.name === bucketName);
        if (ourBucket) {
            console.log('\n   ✓ Bucket "' + bucketName + '" exists!');
        } else {
            console.log('\n   ✗ Bucket "' + bucketName + '" NOT FOUND!');
            console.log('   Available buckets:', buckets.map(b => b.name).join(', '));
        }
    }
} catch (error) {
    console.error('   ✗ Unexpected error:', error);
}
console.log('');

// Test file upload permissions
console.log('5. Testing Upload Permissions...');
try {
    const testFileName = `test_${Date.now()}.txt`;
    const testContent = new Blob(['Test upload'], { type: 'text/plain' });

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`test/${testFileName}`, testContent);

    if (error) {
        console.error('   ✗ Upload test failed:', error.message);
        console.error('   Error details:', error);
    } else {
        console.log('   ✓ Upload test successful!');
        console.log('   Test file path:', data.path);

        // Clean up test file
        await supabase.storage.from(bucketName).remove([`test/${testFileName}`]);
        console.log('   ✓ Test file cleaned up');
    }
} catch (error) {
    console.error('   ✗ Unexpected error during upload test:', error);
}

console.log('\n=== Test Complete ===');
