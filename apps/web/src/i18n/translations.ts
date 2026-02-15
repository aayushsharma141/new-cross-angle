export type Lang = "en" | "hi";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Welcome Screen
    welcome_subtitle: "AESTHETIC DISCOVERY ENGINE",
    welcome_title: "Discover Your Spatial Personality",
    welcome_desc: "A guided journey through instinct, emotion, and texture to reveal the design language that is uniquely yours.",
    welcome_scroll: "Scroll to learn more ↓",
    welcome_what_title: 'What Does "Discovering Your Aesthetic" Really Mean?',
    welcome_what_p1: "Your aesthetic is more than a style. It is the way you feel most like yourself — the environments where your mind feels calm or energized, the colors and textures that quietly resonate with you.",
    welcome_what_p2: "Most people don't consciously know their aesthetic. They feel it — but struggle to describe it. This experience helps you uncover it.",
    welcome_what_p3: "This is not a quiz. There are no right or wrong answers. There is no judgment.",
    welcome_roadmap: "YOUR DISCOVERY ROADMAP",
    welcome_step_reflection: "Reflection",
    welcome_step_reflection_desc: "Guided self-inquiry",
    welcome_step_visual: "Visual Instinct",
    welcome_step_visual_desc: "Image selection",
    welcome_step_emotional: "Emotional Mapping",
    welcome_step_emotional_desc: "Slider calibration",
    welcome_step_material: "Material & Light",
    welcome_step_material_desc: "Tactile & ambiance",
    welcome_step_identity: "Your Identity",
    welcome_step_identity_desc: "Aesthetic reveal",
    welcome_begin: "Begin Your Journey",
    welcome_begin_desc: "Choose the depth of exploration that feels right for you.",
    welcome_quick: "QUICK DISCOVERY",
    welcome_quick_desc: "~2 minutes · 3 stages",
    welcome_deep: "DEEP DIVE",
    welcome_deep_desc: "~5 minutes · All stages",
    welcome_trust: "Trust your instinct · No right answers",

    // Reflection - sections
    reflection_subtitle: "LIFESTYLE DISCOVERY",
    reflection_title: "Your Daily Rhythm",
    reflection_desc: "How you live reveals how you design. There are no right answers — just honest ones.",
    reflection_continue: "CONTINUE",
    reflection_skip: "You can skip any question",
    reflection_next_section: "NEXT",
    reflection_prev_section: "BACK",

    // Section headers
    reflection_section_morning: "🌅 Morning Rhythm",
    reflection_section_midday: "☀️ Midday Energy",
    reflection_section_evening: "🌆 Evening Mood",
    reflection_section_night: "🌙 Night Psychology",
    reflection_section_social: "👥 Social Energy",
    reflection_section_sensory: "🌿 Sensory Orientation",
    reflection_section_deeper: "🧠 Deeper Prompts",
    reflection_section_identity: "🔥 Identity Alignment",

    // Q1 - Morning start
    rq1: "How do you prefer to begin your mornings?",
    rq1_o1: "Slowly, in silence, with natural light",
    rq1_o2: "With movement — workout or stretching",
    rq1_o3: "With coffee and planning the day ahead",
    rq1_o4: "Immediately productive, diving into work",
    rq1_o5: "Surrounded by family or conversation",

    // Q2 - Morning environment
    rq2: "What kind of morning environment feels right to you?",
    rq2_o1: "Sunlight filtering through curtains",
    rq2_o2: "Clean, minimal surfaces",
    rq2_o3: "Music softly playing in the background",
    rq2_o4: "A bustling kitchen or shared space",
    rq2_o5: "A focused, distraction-free setup",

    // Q3 - Midday alive
    rq3: "During the day, you feel most alive when you are…",
    rq3_o1: "Deeply focused on a project",
    rq3_o2: "Collaborating with others",
    rq3_o3: "Exploring new ideas",
    rq3_o4: "Organizing and structuring",
    rq3_o5: "Moving between different environments",

    // Q4 - Ideal workspace
    rq4: "Your ideal work or creative space feels…",
    rq4_o1: "Quiet and enclosed",
    rq4_o2: "Open and airy",
    rq4_o3: "Structured and efficient",
    rq4_o4: "Layered and inspiring",
    rq4_o5: "Dynamic and adaptable",

    // Q5 - Evening preference
    rq5: "How do you prefer to spend your evenings?",
    rq5_o1: "Solitary, with a book",
    rq5_o2: "Hosting a dinner party",
    rq5_o3: "Focused creative work",
    rq5_o4: "Watching a film or listening to music",
    rq5_o5: "Reflecting quietly with soft lighting",
    rq5_o6: "Engaging in meaningful conversations",

    // Q6 - Night atmosphere
    rq6: "What atmosphere do you gravitate toward at night?",
    rq6_o1: "Warm, dim lighting",
    rq6_o2: "Crisp and modern brightness",
    rq6_o3: "Candlelight and texture",
    rq6_o4: "Ambient sound and layered shadows",
    rq6_o5: "Calm minimal silence",

    // Q7 - Before sleep
    rq7: "Before sleep, you usually…",
    rq7_o1: "Journal or reflect",
    rq7_o2: "Scroll or browse",
    rq7_o3: "Read or learn something",
    rq7_o4: "Plan tomorrow",
    rq7_o5: "Drift off naturally",

    // Q8 - Bedroom
    rq8: "Your bedroom should feel like…",
    rq8_o1: "A sanctuary",
    rq8_o2: "A retreat from the world",
    rq8_o3: "A design statement",
    rq8_o4: "A soft cocoon",
    rq8_o5: "A simple, clean reset space",

    // Q9 - Guests feel
    rq9: "When people enter your space, you want them to feel…",
    rq9_o1: "Calm and welcomed",
    rq9_o2: "Impressed",
    rq9_o3: "Inspired",
    rq9_o4: "Comfortable and at ease",
    rq9_o5: "Energized",

    // Q10 - Hosting
    rq10: "How often do you host others?",
    rq10_o1: "Rarely — I value privacy",
    rq10_o2: "Occasionally — intimate gatherings",
    rq10_o3: "Frequently — I enjoy entertaining",
    rq10_o4: "Only close friends",
    rq10_o5: "I prefer being a guest",

    // Q11 - Sensory sensitivity
    rq11: "You're most sensitive to…",
    rq11_o1: "Lighting",
    rq11_o2: "Sound",
    rq11_o3: "Texture",
    rq11_o4: "Temperature",
    rq11_o5: "Spatial openness",

    // Q12 - Closest statement
    rq12: "Which statement feels closest to you?",
    rq12_o1: "I need order to feel calm",
    rq12_o2: "I need warmth to feel safe",
    rq12_o3: "I need stimulation to feel alive",
    rq12_o4: "I need quiet to think",
    rq12_o5: "I need beauty to feel inspired",

    // Q13 - Drains fastest
    rq13: "Which environment drains you fastest?",
    rq13_o1: "Loud and chaotic spaces",
    rq13_o2: "Overly minimal cold spaces",
    rq13_o3: "Dark and heavy rooms",
    rq13_o4: "Overly bright sterile interiors",
    rq13_o5: "Cluttered environments",

    // Q14 - Home protects from
    rq14: "If your home protected you from something, it would protect you from…",
    rq14_o1: "Noise",
    rq14_o2: "Chaos",
    rq14_o3: "Emotional overwhelm",
    rq14_o4: "Isolation",
    rq14_o5: "Distraction",

    // Q15 - Lifestyle statement
    rq15: "Which lifestyle statement feels most accurate?",
    rq15_o1: "I am building a peaceful life",
    rq15_o2: "I am building a powerful life",
    rq15_o3: "I am building a creative life",
    rq15_o4: "I am building a meaningful life",
    rq15_o5: "I am building a disciplined life",

    // Adjective Selection
    adjective_subtitle: "PUT WORDS TO YOUR FEELINGS",
    adjective_title: "Which Words Resonate?",
    adjective_desc: "Select 3–5 words that describe how your ideal space should feel.",
    adjective_freetext: "Or describe in your own words…",
    adjective_placeholder: "e.g., 'A sunlit library with stone walls'",
    adjective_continue: "CONTINUE",
    adjective_count: "selected",

    // Pattern Preview
    pattern_subtitle: "PATTERN SYNTHESIS",
    pattern_title: "Your Patterns Are Emerging",
    pattern_lean: "Most of your choices lean toward",
    pattern_color: "COLOR PALETTE",
    pattern_materials: "MATERIALS",
    pattern_energy: "ENERGY",
    pattern_reveal: "REVEAL MY AESTHETIC IDENTITY",

    // Analysis phases
    analysis_phase_1: "Reading your aesthetic signals…",
    analysis_phase_2: "Interpreting emotional patterns…",
    analysis_phase_3: "Synthesizing your unique identity…",
    analysis_phase_4: "Crafting your design language…",
    analysis_phase_5: "Finalizing your aesthetic DNA…",

    // Results
    results_identity: "YOUR AESTHETIC IDENTITY",
    results_sensory: "Sensory Blueprint",
    results_why: "Why this matters",
    results_why_text: "Discovering your aesthetic isn't about trends. It's about alignment. When your environment reflects you, you make clearer decisions and feel more at peace.",
    results_dna: "Aesthetic DNA",
    results_traits: "KEY TRAITS",
    results_material: "MATERIAL BIAS",
    results_strategy: "Design Strategy",
    results_learning: "Learning Profile",
    results_novelty: "NOVELTY TOLERANCE",
    results_density: "DENSITY THRESHOLD",
    results_tone: "EMOTIONAL TONE",
    results_depth: "COGNITIVE DEPTH",
    results_conscious: "A Conscious Beginning",
    results_conscious_text: "You have transformed abstract thoughts into something real. Use this blueprint to guide your next decision.",
    results_download: "Download Profile",
    results_retake: "Start Over",
  },
  hi: {
    // Welcome Screen
    welcome_subtitle: "AESTHETIC DISCOVERY ENGINE",
    welcome_title: "Apni Spatial Personality Discover Karein",
    welcome_desc: "Instinct, emotion, aur texture ke through ek guided journey jo aapki unique design language reveal karegi.",
    welcome_scroll: "Aur jaanne ke liye scroll karein ↓",
    welcome_what_title: '"Apna Aesthetic Discover Karna" ka matlab kya hai?',
    welcome_what_p1: "Aapka aesthetic sirf ek style nahi hai. Yeh woh tarika hai jismein aap sabse zyada khud jaisi feel karte hain — woh environments jahan aapka mann shant ya energized lagta hai, woh colors aur textures jo aapko naturally pasand aate hain.",
    welcome_what_p2: "Zyaadatar logon ko apna aesthetic consciously nahi pata hota. Woh feel karte hain — par describe nahi kar paate. Yeh experience aapko uncover karne mein madad karega.",
    welcome_what_p3: "Yeh koi quiz nahi hai. Koi sahi ya galat answer nahi hai. Koi judgment nahi hai.",
    welcome_roadmap: "AAPKA DISCOVERY ROADMAP",
    welcome_step_reflection: "Reflection",
    welcome_step_reflection_desc: "Guided self-inquiry",
    welcome_step_visual: "Visual Instinct",
    welcome_step_visual_desc: "Image selection",
    welcome_step_emotional: "Emotional Mapping",
    welcome_step_emotional_desc: "Slider calibration",
    welcome_step_material: "Material & Light",
    welcome_step_material_desc: "Tactile & ambiance",
    welcome_step_identity: "Aapki Identity",
    welcome_step_identity_desc: "Aesthetic reveal",
    welcome_begin: "Apni Journey Shuru Karein",
    welcome_begin_desc: "Woh depth choose karein jo aapko sahi lage.",
    welcome_quick: "QUICK DISCOVERY",
    welcome_quick_desc: "~2 minute · 3 stages",
    welcome_deep: "DEEP DIVE",
    welcome_deep_desc: "~5 minute · Saare stages",
    welcome_trust: "Apni instinct pe trust karein · Koi sahi answer nahi hai",

    // Reflection
    reflection_subtitle: "LIFESTYLE DISCOVERY",
    reflection_title: "Aapki Daily Rhythm",
    reflection_desc: "Aap kaise jeete hain, yeh batata hai aap kaise design karte hain. Koi sahi answer nahi — bas honest answers.",
    reflection_continue: "AAGE BADHEIN",
    reflection_skip: "Koi bhi question skip kar sakte hain",
    reflection_next_section: "AAGE",
    reflection_prev_section: "PEECHE",

    // Section headers
    reflection_section_morning: "🌅 Morning Rhythm",
    reflection_section_midday: "☀️ Midday Energy",
    reflection_section_evening: "🌆 Evening Mood",
    reflection_section_night: "🌙 Night Psychology",
    reflection_section_social: "👥 Social Energy",
    reflection_section_sensory: "🌿 Sensory Orientation",
    reflection_section_deeper: "🧠 Deeper Prompts",
    reflection_section_identity: "🔥 Identity Alignment",

    // Q1
    rq1: "Aap apni mornings kaise shuru karna pasand karte hain?",
    rq1_o1: "Dheere, khamoshi mein, natural light ke saath",
    rq1_o2: "Movement ke saath — workout ya stretching",
    rq1_o3: "Coffee aur din ki planning ke saath",
    rq1_o4: "Turant productive, kaam mein doob jaana",
    rq1_o5: "Family ya baatcheet ke beech",

    // Q2
    rq2: "Kaisa morning environment aapko sahi lagta hai?",
    rq2_o1: "Curtains se chhan kar aati sunlight",
    rq2_o2: "Clean, minimal surfaces",
    rq2_o3: "Background mein dheemi music",
    rq2_o4: "Busy kitchen ya shared space",
    rq2_o5: "Focused, distraction-free setup",

    // Q3
    rq3: "Din mein aap sabse zyada alive feel karte hain jab…",
    rq3_o1: "Kisi project mein deeply focused hon",
    rq3_o2: "Doosron ke saath collaborate kar rahe hon",
    rq3_o3: "Naye ideas explore kar rahe hon",
    rq3_o4: "Organize aur structure kar rahe hon",
    rq3_o5: "Alag-alag environments mein move kar rahe hon",

    // Q4
    rq4: "Aapka ideal work ya creative space kaisa feel karta hai…",
    rq4_o1: "Quiet aur enclosed",
    rq4_o2: "Open aur airy",
    rq4_o3: "Structured aur efficient",
    rq4_o4: "Layered aur inspiring",
    rq4_o5: "Dynamic aur adaptable",

    // Q5
    rq5: "Aap apni shaam kaise bitana pasand karte hain?",
    rq5_o1: "Akele, kitaab ke saath",
    rq5_o2: "Dinner party host karte hue",
    rq5_o3: "Focused creative kaam",
    rq5_o4: "Film dekh ke ya music sun ke",
    rq5_o5: "Soft lighting mein quietly reflect karte hue",
    rq5_o6: "Meaningful baatcheet mein",

    // Q6
    rq6: "Raat ko aap kis atmosphere ki taraf jhukte hain?",
    rq6_o1: "Warm, dim lighting",
    rq6_o2: "Crisp aur modern brightness",
    rq6_o3: "Candlelight aur texture",
    rq6_o4: "Ambient sound aur layered shadows",
    rq6_o5: "Calm minimal silence",

    // Q7
    rq7: "Sone se pehle aap usually…",
    rq7_o1: "Journal ya reflect karte hain",
    rq7_o2: "Scroll ya browse karte hain",
    rq7_o3: "Kuch padhte ya seekhte hain",
    rq7_o4: "Kal ki planning karte hain",
    rq7_o5: "Naturally so jaate hain",

    // Q8
    rq8: "Aapka bedroom kaisa feel karna chahiye…",
    rq8_o1: "Ek sanctuary",
    rq8_o2: "Duniya se door ek retreat",
    rq8_o3: "Ek design statement",
    rq8_o4: "Ek soft cocoon",
    rq8_o5: "Simple, clean reset space",

    // Q9
    rq9: "Jab log aapki space mein aayein, aap chahte hain ki woh feel karein…",
    rq9_o1: "Calm aur welcomed",
    rq9_o2: "Impressed",
    rq9_o3: "Inspired",
    rq9_o4: "Comfortable aur at ease",
    rq9_o5: "Energized",

    // Q10
    rq10: "Aap kitni baar logo ko host karte hain?",
    rq10_o1: "Kabhi kabhar — privacy important hai",
    rq10_o2: "Kabhi kabhi — chhoti gatherings",
    rq10_o3: "Aksar — entertaining enjoy karta/karti hoon",
    rq10_o4: "Sirf close friends",
    rq10_o5: "Guest banna zyada pasand hai",

    // Q11
    rq11: "Aap sabse zyada sensitive hain…",
    rq11_o1: "Lighting ke liye",
    rq11_o2: "Sound ke liye",
    rq11_o3: "Texture ke liye",
    rq11_o4: "Temperature ke liye",
    rq11_o5: "Spatial openness ke liye",

    // Q12
    rq12: "Kaunsa statement aapke sabse kareeb hai?",
    rq12_o1: "Mujhe calm feel karne ke liye order chahiye",
    rq12_o2: "Mujhe safe feel karne ke liye warmth chahiye",
    rq12_o3: "Mujhe alive feel karne ke liye stimulation chahiye",
    rq12_o4: "Mujhe sochne ke liye quiet chahiye",
    rq12_o5: "Mujhe inspired feel karne ke liye beauty chahiye",

    // Q13
    rq13: "Kaunsa environment aapko sabse jaldi drain karta hai?",
    rq13_o1: "Loud aur chaotic spaces",
    rq13_o2: "Bahut zyada minimal cold spaces",
    rq13_o3: "Dark aur heavy rooms",
    rq13_o4: "Bahut zyada bright sterile interiors",
    rq13_o5: "Cluttered environments",

    // Q14
    rq14: "Agar aapka ghar kisi cheez se protect karta, toh woh hoga…",
    rq14_o1: "Noise",
    rq14_o2: "Chaos",
    rq14_o3: "Emotional overwhelm",
    rq14_o4: "Isolation",
    rq14_o5: "Distraction",

    // Q15
    rq15: "Kaunsa lifestyle statement sabse accurate lagta hai?",
    rq15_o1: "Main ek peaceful life bana raha/rahi hoon",
    rq15_o2: "Main ek powerful life bana raha/rahi hoon",
    rq15_o3: "Main ek creative life bana raha/rahi hoon",
    rq15_o4: "Main ek meaningful life bana raha/rahi hoon",
    rq15_o5: "Main ek disciplined life bana raha/rahi hoon",

    // Adjective Selection
    adjective_subtitle: "APNI FEELINGS KO SHABD DEIN",
    adjective_title: "Kaunse Shabd Resonate Karte Hain?",
    adjective_desc: "3–5 shabd chunein jo describe karein ki aapki ideal space kaisi feel honi chahiye.",
    adjective_freetext: "Ya apne shabdon mein batayein…",
    adjective_placeholder: "jaise, 'Dhoop wali library jismein stone walls hon'",
    adjective_continue: "AAGE BADHEIN",
    adjective_count: "selected",

    // Pattern Preview
    pattern_subtitle: "PATTERN SYNTHESIS",
    pattern_title: "Aapke Patterns Ubhar Rahe Hain",
    pattern_lean: "Aapke zyaadatar choices ka ruzhaan hai",
    pattern_color: "COLOR PALETTE",
    pattern_materials: "MATERIALS",
    pattern_energy: "ENERGY",
    pattern_reveal: "MERI AESTHETIC IDENTITY REVEAL KAREIN",

    // Analysis phases
    analysis_phase_1: "Aapke aesthetic signals padh rahe hain…",
    analysis_phase_2: "Emotional patterns samajh rahe hain…",
    analysis_phase_3: "Aapki unique identity bana rahe hain…",
    analysis_phase_4: "Aapki design language craft kar rahe hain…",
    analysis_phase_5: "Aapka aesthetic DNA finalize kar rahe hain…",

    // Results
    results_identity: "AAPKI AESTHETIC IDENTITY",
    results_sensory: "Sensory Blueprint",
    results_why: "Yeh kyun zaroori hai",
    results_why_text: "Apna aesthetic discover karna trends ke baare mein nahi hai. Yeh alignment ke baare mein hai. Jab aapka environment aapko reflect karta hai, toh aap clear decisions lete hain aur zyada sukoon mein rehte hain.",
    results_dna: "Aesthetic DNA",
    results_traits: "KEY TRAITS",
    results_material: "MATERIAL BIAS",
    results_strategy: "Design Strategy",
    results_learning: "Learning Profile",
    results_novelty: "NOVELTY TOLERANCE",
    results_density: "DENSITY THRESHOLD",
    results_tone: "EMOTIONAL TONE",
    results_depth: "COGNITIVE DEPTH",
    results_conscious: "Ek Conscious Shuruaat",
    results_conscious_text: "Aapne abstract thoughts ko kuch real mein badal diya hai. Is blueprint ko apne agle decision ki guide ke roop mein use karein.",
    results_download: "Profile Download Karein",
    results_retake: "Dobara Shuru Karein",
  },
};

export default translations;
