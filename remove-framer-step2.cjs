const fs = require('fs');

const path = 'apps/web/src/addons/calculators/components/steps/StepPropertyDetails.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import \{ motion.*\} from "framer-motion";\n/g, '');
content = content.replace(/import \{.*?\} from "\.\.\/data\/framer-variants";\n/g, '');
content = content.replace(/<motion\./g, '<');
content = content.replace(/<\/motion\./g, '</');
content = content.replace(/\s+variants=\{[^}]+\}/g, '');
content = content.replace(/\s+initial=\{[^}]+\}/g, '');
content = content.replace(/\s+animate=\{[^}]+\}/g, '');
content = content.replace(/\s+exit=\{[^}]+\}/g, '');
content = content.replace(/\s+transition=\{[^}]+\}/g, '');
content = content.replace(/\s+whileHover=\{[^}]+\}/g, '');
content = content.replace(/\s+whileTap=\{[^}]+\}/g, '');

fs.writeFileSync(path, content);
