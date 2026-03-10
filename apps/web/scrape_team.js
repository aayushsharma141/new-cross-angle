import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co',
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ'
);

const url = 'https://crossangleinterior.com/about-us/';

async function parseTeam() {
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();

    // Load cheerio dynamically if we want or just use regex
    // Let's use regex since the structure is usually predictable.
    // The Team member section usually looks like:
    // <div class="team-img"> ... <img src="..." > ...
    // <h4 class="team-title">...</h4>
    // <span class="team-designation">...</span>

    const teamRegex = /<div class="team-img"[^>]*>[\s\S]*?<img [^>]*src="([^"]+)"[^>]*>[\s\S]*?<div class="team-content">[\s\S]*?<h4 class="team-title"[^>]*><a[^>]*>([^<]+)<\/a><\/h4>[\s\S]*?<span class="team-designation"[^>]*>([^<]+)<\/span>/gi;

    let match;
    const team = [];
    let order = 0;

    while ((match = teamRegex.exec(html)) !== null) {
        team.push({
            image_url: match[1],
            name: match[2].trim(),
            role: match[3].trim(),
            display_order: order++
        });
    }

    // fallback logic if classes differ slightly
    if (team.length === 0) {
        console.log('Regex 1 failed, trying Regex 2...');
        const teamRegex2 = /<div class="team-member[^>]*>[\s\S]*?<img [^>]*src="([^"]+)"[^>]*>[\s\S]*?<h[34][^>]*>([^<]+)<\/h[34]>[\s\S]*?<p class="role"[^>]*>([^<]+)<\/p>/gi;
        while ((match = teamRegex2.exec(html)) !== null) {
            team.push({
                image_url: match[1],
                name: match[2].trim(),
                role: match[3].trim(),
                display_order: order++
            });
        }
    }

    // fallback logic 3 - let's look for elementor classes
    if (team.length === 0) {
        console.log('Regex 2 failed, trying Elementor general regex...');
        // Looking for figure / h4 / etc or specific names since we know them
        const names = [
            "Shrikant Sharma", "Chanda Sharma", "Hema Kumari",
            "Bhusan Kumar", "Shubham Sharma", "Souvik Dey"
        ];

        for (const name of names) {
            // Find the block containing the name
            const blockRegex = new RegExp(`<img [^>]*src="([^"]+)"[^>]*>[\\s\\S]{0,500}?${name}[\\s\\S]{0,100}?(?:<span|<p|<h5)[^>]*>([^<]+)`, 'gi');
            const m = blockRegex.exec(html);
            if (m) {
                team.push({
                    image_url: m[1],
                    name: name,
                    role: m[2].trim().replace(/<\/?(?:span|p|h5|div)[^>]*>/g, ''),
                    display_order: order++
                });
            }
        }
    }

    return team;
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

    const teamData = await parseTeam();
    console.log(`Found ${teamData.length} team members.`);

    // Clean the db mapping
    for (const t of teamData) {
        console.log(`- ${t.name} (${t.role}) : ${t.image_url}`);

        const payload = {
            name: t.name,
            role: t.role,
            image_url: t.image_url,
            display_order: t.display_order
        };

        const { data, error } = await supabase
            .from('team_members')
            .insert(payload);

        if (error) {
            console.error(`Error inserting ${t.name}:`, error);
        }
    }

    console.log('Done!');
}

run();
