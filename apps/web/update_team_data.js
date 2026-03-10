import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co',
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ'
);

const localTeamData = [
    {
        name: "Shrikant Sharma",
        role: "Chief Visionary Officer & Founding Principal",
        bio: "Exemplifying over two decades of architectural excellence, Shrikant curates the philosophical foundation of every Cross Angle commission.",
        social: { instagram: "#", linkedin: "#", email: "shrikant@crossangle.in" }
    },
    {
        name: "Chanda Sharma",
        role: "Director of Aesthetic Excellence",
        bio: "Chanda is the vanguard of our interior philosophy, ensuring that every texture and tone resonates with the silent language of luxury.",
        social: { instagram: "#", linkedin: "#", email: "chanda@crossangle.in" }
    },
    {
        name: "Hema Kumari",
        role: "Spatial Visualization Expert",
        bio: "Hema orchestrates the transition from abstract concept to living reality, masterfully visualizing the anticipation of space.",
        social: { instagram: "#", linkedin: "#" }
    },
    {
        name: "Bhusan Kumar",
        role: "Director of Operations & Strategic Growth",
        bio: "Architecting the operational backbone of the studio, Bhusan ensures the precision and scale of our visionary projects.",
        social: { linkedin: "#" }
    },
    {
        name: "Shubham Sharma",
        role: "Brand Experience & Digital Strategy Lead",
        bio: "Defining how the digital world anticipates the Cross Angle experience through immersive brand storytelling.",
        social: { instagram: "#", linkedin: "#" }
    },
    {
        name: "Souvik Dey",
        role: "Client Relationship & Brand Ambassador",
        bio: "The silent bridge between our studio's vision and our clients' legacy, Souvik curates the journey of anticipation.",
        social: { linkedin: "#", email: "souvik@crossangle.in" }
    }
];

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

    // Fetch the existing members to match the names
    const { data: existingMembers, error: fetchError } = await supabase
        .from('team_members')
        .select('*');

    if (fetchError) {
        console.error('Failed to fetch existing members:', fetchError);
        return;
    }

    for (const localMember of localTeamData) {
        // Find the corresponding member in the DB to keep their image_url
        const dbMember = existingMembers.find(m => m.name.toLowerCase().trim() === localMember.name.toLowerCase().trim());

        if (dbMember) {
            console.log(`Updating ${dbMember.name}...`);

            const payload = {
                role: localMember.role,
                bio: localMember.bio,
                instagram_url: localMember.social.instagram !== '#' ? localMember.social.instagram : null,
                linkedin_url: localMember.social.linkedin !== '#' ? localMember.social.linkedin : null,
                email: localMember.social.email || null
            };

            const { error: updateError } = await supabase
                .from('team_members')
                .update(payload)
                .eq('id', dbMember.id);

            if (updateError) {
                console.error(`Failed to update ${dbMember.name}:`, updateError);
            } else {
                console.log(`Successfully updated ${dbMember.name} (Role: ${localMember.role}).`);
            }
        } else {
            console.log(`Warning: Could not find ${localMember.name} in the database.`);
        }
    }
    console.log('Finished updating team members!');
}

run();
