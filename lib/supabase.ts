import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Validate URL format
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase environment variables are not set. Database operations will fail.');
  console.warn('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local');
}

if (supabaseUrl && !isValidUrl(supabaseUrl)) {
  console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL format. Must be a valid HTTP/HTTPS URL.');
  console.error(`   Current value: ${supabaseUrl.substring(0, 50)}...`);
  console.error('   Expected format: https://your-project-id.supabase.co');
}

// Create Supabase client with service role key (for server-side API routes)
// This bypasses Row Level Security (RLS) - only use in server-side code
export const supabase = 
  supabaseUrl && 
  supabaseServiceKey && 
  isValidUrl(supabaseUrl)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;

