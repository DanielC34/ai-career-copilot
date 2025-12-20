/**
 * Supabase client configuration
 * 
 * This file exports two Supabase clients:
 * 1. supabaseClient - Public (anon) client for browser-safe operations
 * 2. supabaseServiceClient - Service role client for server-only operations with elevated privileges
 * 
 * Usage:
 * - Use supabaseClient in client components for read operations
 * - Use supabaseServiceClient in API routes for uploads, admin operations
 */

import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Public Supabase client (browser-safe)
 * Uses the anon key with Row Level Security enforced
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service role Supabase client (server-only)
 * Has elevated privileges - NEVER expose to the client!
 * Use only in API routes and server components
 */
export const supabaseServiceClient = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

// Warn if service client is not available (non-critical for development)
if (!supabaseServiceClient) {
    console.warn('⚠️  SUPABASE_SERVICE_KEY not set - upload functionality will be limited');
} else {
    console.log('✓ Supabase service client initialized successfully');
    console.log('  URL:', supabaseUrl);
    console.log('  Service key length:', supabaseServiceKey?.length);
}

/**
 * Get the bucket name from environment or use default
 */
export const STORAGE_BUCKET = process.env.SUPABASE_BUCKET || 'resumes';
