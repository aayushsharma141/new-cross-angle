const fs = require('fs');

const path = 'apps/web/src/addons/calculators/components/steps/StepPropertyDetails.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove framer-motion imports
content = content.replace(/import \{ motion.*\} from "framer-motion";\n/g, '');
content = content.replace(/import \{.*?\} from "\.\.\/data\/framer-variants";\n/g, '');

// 2. Remove framer-motion components and props
content = content.replace(/<motion\./g, '<');
content = content.replace(/<\/motion\./g, '</');
content = content.replace(/\s+variants=\{[^}]+\}/g, '');
content = content.replace(/\s+initial=\{[^}]+\}/g, '');
content = content.replace(/\s+animate=\{[^}]+\}/g, '');
content = content.replace(/\s+exit=\{[^}]+\}/g, '');
content = content.replace(/\s+transition=\{[^}]+\}/g, '');
content = content.replace(/\s+whileHover=\{[^}]+\}/g, '');
content = content.replace(/\s+whileTap=\{[^}]+\}/g, '');

// 3. Add progressive disclosure logic
const areaSliderStart = `            {/* ── Area slider ── */}`;
const progressiveOpening = `            {/* ── Progressive Disclosure ── */}
            {(!((isApartment || isVilla || isTurnkey) && !formData.bhk)) && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-0">
            {/* ── Area slider ── */}`;
content = content.replace(areaSliderStart, progressiveOpening);

// Inject closing tags before the final `</div>\n    );\n}`
// Use lastIndexOf to ensure we only replace the very last one.
const componentEndRegex = /        <\/div>\r?\n    \);\r?\n\}\r?\n?$/;
const match = content.match(componentEndRegex);
if (match) {
    content = content.replace(componentEndRegex, `                </div>\n            )}\n        </div>\n    );\n}\n`);
} else {
    console.error("Could not find end of component.");
}

fs.writeFileSync(path, content);
console.log('Fixed StepPropertyDetails.tsx');
