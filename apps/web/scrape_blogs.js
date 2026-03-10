import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase with Service Role Key
// Since we couldn't find the service role key previously in `.env`, we will use the user session trick or prompt.
// Actually, earlier the user ran `node grant_admin.js` which failed because it didn't find `SUPABASE_SERVICE_ROLE_KEY`. 
// But wait, the admin was inserted via Supabase Dashboard!
// So we can authenticate using the email and password:
// sharma1.aayu@gmail.com / cross1@AS

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co',
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ'
);

const urls = [
    'https://crossangleinterior.com/blog/dining-room-design-tips-for-2024-create-a-space-to-savor-with-cross-angle-interior/',
    'https://crossangleinterior.com/blog/bathroom-design-tips-for-2024-elevate-your-space-with-cross-angle-interior/',
    'https://crossangleinterior.com/blog/bedroom-design-tips-for-2024-transform-your-space-with-cross-angle-interior/'
];

async function parseHTML(url) {
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();

    // Extract title
    let titleMatch = html.match(/<h1 class="entry-title"[^>]*>(.*?)<\/h1>/i);
    if (!titleMatch) titleMatch = html.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1] : 'Unknown Title';
    title = title.split(' –')[0]; // Clean up ' - Cross Angle...'

    // Extract content
    // Look for entry-content
    let contentMatch = html.match(/<div class="entry-content"[^>]*>([\s\S]*?)<\/div>\s*<!-- \.entry-content/i) ||
        html.match(/<div class="elementor-widget-container">([\s\S]*?)<\/div> <!-- \.elementor-widget-container /i) ||
        html.match(/<div class="entry-content[^>]*>([\s\S]*?)<\/div><!-- \.entry-content -->/i) ||
        html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    // If we can't get entry-content, let's just grab the whole post-content or article part
    if (!contentMatch) {
        contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    }

    let content = contentMatch ? contentMatch[1] : 'No content found';

    // Extract cover image
    let imageMatch = html.match(/<meta property="og:image" content="(.*?)"/i) || html.match(/<img width="[^"]*" height="[^"]*" src="(.*?)" class="attachment-post-thumbnail/i);
    let cover_image = imageMatch ? imageMatch[1] : null;

    const slug = url.split('/').filter(Boolean).pop();

    return { title, content, cover_image, slug };
}

async function run() {
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'sharma1.aayu@gmail.com',
        password: 'cross1@AS'
    });

    if (authError) {
        console.error('Login Failed:', authError);
        return;
    }

    console.log('Logged in successfully!');

    for (const url of urls) {
        try {
            const data = await parseHTML(url);

            const payload = {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.content.replace(/<[^>]+>/g, ' ').substring(0, 150) + '...',
                cover_image: data.cover_image,
                status: 'published',
                author_id: authData.user.id
            };

            console.log(`Inserting: ${payload.title}`);

            const { error } = await supabase
                .from('blogs')
                .upsert(payload, { onConflict: 'slug' });

            if (error) {
                console.error('Error inserting blog:', error);
            } else {
                console.log('Successfully inserted!');
            }
        } catch (err) {
            console.error(`Error processing ${url}:`, err);
        }
    }

    console.log('Done!');
}

run();
