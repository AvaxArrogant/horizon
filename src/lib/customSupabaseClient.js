import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swluoeixpgnnzpcmgseh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bHVvZWl4cGdubnpwY21nc2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjI0ODIsImV4cCI6MjA2ODQ5ODQ4Mn0.uwCIN0NSnEBSqmg0m2tLnQPl7WXB7vkd_nas2Tlh0co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);