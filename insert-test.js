const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertDummyTest() {
    console.log('Inserting dummy test...');

    // 1. Insert Test
    const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
            title: 'Verification Test (Script)',
            description: 'This is a test created via script for verification.',
            thumbnail_url: 'https://placehold.co/600x400',
            type: 'mbti',
            theme_color: '#ef4444', // Red
            created_by: '00000000-0000-0000-0000-000000000000' // Dummy UUID
        })
        .select()
        .single();

    if (testError) {
        console.error('Error inserting test:', testError);
        return;
    }
    console.log('Test created:', test.id);

    // 2. Insert Question (Just 1 for simplicity)
    const { data: question, error: qError } = await supabase
        .from('questions')
        .insert({
            test_id: test.id,
            content: 'Do you prefer being alone or with people?',
            order_index: 0
        })
        .select()
        .single();

    if (qError) {
        console.error('Error inserting question:', qError);
        return;
    }
    console.log('Question created:', question.id);

    // 3. Insert Options
    const { error: oError } = await supabase
        .from('options')
        .insert([
            {
                question_id: question.id,
                content: 'With people (E)',
                mbti_indicator: 'E',
                order_index: 0
            },
            {
                question_id: question.id,
                content: 'Alone (I)',
                mbti_indicator: 'I',
                order_index: 1
            }
        ]);

    if (oError) {
        console.error('Error inserting options:', oError);
        return;
    }
    console.log('Options created');

    // 4. Insert Result (Map 'E' -> Result E, 'I' -> Result I)
    const { error: rError } = await supabase
        .from('results')
        .insert([
            {
                test_id: test.id,
                mbti_result: 'ESTJ',
                title: 'Social Butterfly (ESTJ)',
                description: 'You love being around people!',
                image_url: 'https://placehold.co/600x400/orange/white',
                min_score: 0,
                max_score: 0
            },
            {
                test_id: test.id,
                mbti_result: 'ISTJ',
                title: 'Quiet Observer (ISTJ)',
                description: 'You prefer your own company.',
                image_url: 'https://placehold.co/600x400/blue/white',
                min_score: 0,
                max_score: 0
            }
        ]);

    if (rError) {
        console.error('Error inserting results:', rError);
        return;
    }
    console.log('Results created');
    console.log('Done!');
}

insertDummyTest();
