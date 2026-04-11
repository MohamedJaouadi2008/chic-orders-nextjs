// Server-side Supabase client for use in Server Components (e.g. generateMetadata)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nbyeexxzqbgtjmxldbjc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieWVleHh6cWJndGpteGxkYmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDI2NzQsImV4cCI6MjA4NTYxODY3NH0.2IKOedm1tIUwZDnIoLScmmgMBwuhESyiQ07Ogi5r7Rw";

export const supabaseServer = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
