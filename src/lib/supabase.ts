import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = "https://dzbkzxcfuzicftmlywcd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Ymt6eGNmdXppY2Z0bWx5d2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTQxOTQsImV4cCI6MjA3MTM3MDE5NH0.J8OJge8IpX3JVGjylFl6CXSmF_s0VmrGGjtWTtIxFYw";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
