import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = "https://kkomsualkaezfvuhonma.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrb21zdWFsa2FlemZ2dWhvbm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODg1MjEsImV4cCI6MjA3MTQ2NDUyMX0.DueEZfMVto6bqYT0WbHo1SbDYJCu2bXotV9bdhX0Tms";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
