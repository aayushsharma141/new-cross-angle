# Phase 9: Discovery Engine v2 - Context & Decisions

## Locked Decisions
1. **No Auto-Generated Archetypes:** The engine will strictly use 5 pre-defined archetypes (The Refined Modernist, The Warm Contemporary, The Quiet Luxury Collector, The Functional Family Planner, The Urban Minimalist).
2. **Behavior Over Style:** The questions must test Behavioral Dimensions (Function, Comfort, Status, Aesthetics, Efficiency, Hosting, Personal Expression, Maintenance Simplicity) rather than asking the user if they like "Scandinavian" or "Bohemian" styles.
3. **Visuals for Taste, Text for Behavior:** Lifestyle and Pain Point questions use text cards. Aesthetic and Material questions use image-based visual voting.
4. **The Ultimate Pivot Question:** The quiz will end with "What matters most?" (A Beautiful Home, A Practical Home, A Home That Impresses, A Home That Ages Well, A Home That Reflects Me) which will hold massive weight in the scoring algorithm.
5. **Dynamic Tiering:** The `Recommended Tier` is separated from the `Archetype`. It is calculated dynamically using `Archetype + Home Size + Customization Need + Material Preference`.
6. **Blueprint Depth:** The final result is not just a label. It includes a 100-150 word personalized explanation mapping their exact choices to the archetype recommendation. 
7. **The Moat:** The Discovery Engine is intrinsically linked to the Estimator. You cannot get a hyper-personalized estimate without the Discovery Blueprint first.
