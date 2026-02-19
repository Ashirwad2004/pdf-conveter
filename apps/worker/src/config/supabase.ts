import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key not set!');
} else {
    console.log(`Supabase Config: URL=${supabaseUrl}, KeyLength=${supabaseKey.length}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
