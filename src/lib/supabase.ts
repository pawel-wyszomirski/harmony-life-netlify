import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrldbikyhjftyxpcfupm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybGRiaWt5aGpmdHl4cGNmdXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODc5NTAsImV4cCI6MjA0NjU2Mzk1MH0.RtvBNxEQdXZu8SA8_EZwzIw-0vmRk9gEolEVy4Ta61g';

export const supabase = createClient(supabaseUrl, supabaseKey);