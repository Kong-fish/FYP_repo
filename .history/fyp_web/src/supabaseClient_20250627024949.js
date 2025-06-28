import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffgttynqeijqsfcxqxbh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ3R0eW5xZWlqcXNmY3hxeGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNTUzOTAsImV4cCI6MjA1MTczMTM5MH0.zKiig3PuCEE6S3_IuImJ8eB_bt_0lq6Eno-M8_6Pzw4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);



export default supabase;