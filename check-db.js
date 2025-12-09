const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCommentsTable() {
    console.log('Checking comments table...');
    const { data, error } = await supabase.from('comments').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error accessing comments table:', error.message);
        if (error.code === '42P01') {
            console.log('Table "comments" does not exist.');
        }
    } else {
        console.log('Comments table exists. Accessible.');
    }
}

checkCommentsTable();
