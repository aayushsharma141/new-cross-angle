const fs = require('fs');

const path = 'c:\\Users\\aayus\\Desktop\\main\\apps\\web\\src\\addons\\calculators\\components\\steps\\StepResults.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import \{ motion, AnimatePresence \} from "framer-motion";/g, 'import { AnimatePresence, motion } from "framer-motion";');

content = content.replace(/<motion\.div([^>]*)>/g, (match, g1) => {
    return '<div' + g1
        .replace(/variants=\{[^}]+\}/g, '')
        .replace(/initial=\{[^}]+\}/g, '')
        .replace(/initial="[^"]+"/g, '')
        .replace(/animate=\{[^}]+\}/g, '')
        .replace(/animate="[^"]+"/g, '')
        .replace(/transition=\{[^}]+\}/g, '') + '>';
});
content = content.replace(/<\/motion\.div>/g, '</div>');
content = content.replace(/<\/motion\.div >/g, '</div>');

content = content.replace(/<motion\.h2([^>]*)>/g, (match, g1) => {
    return '<h2' + g1.replace(/variants=\{[^}]+\}/g, '') + '>';
});
content = content.replace(/<\/motion\.h2>/g, '</h2>');

content = content.replace(/<motion\.p([^>]*)>/g, (match, g1) => {
    return '<p' + g1.replace(/variants=\{[^}]+\}/g, '') + '>';
});
content = content.replace(/<\/motion\.p>/g, '</p>');

content = content.replace(/<motion\.span([^>]*)>/g, (match, g1) => {
    return '<span' + g1
        .replace(/animate=\{[^}]+\}/g, '')
        .replace(/transition=\{[^}]+\}/g, '') + '>';
});
content = content.replace(/<\/motion\.span>/g, '</span>');

content = content.replace(/<motion\.button([^>]*)>/g, (match, g1) => {
    return '<button' + g1.replace(/variants=\{[^}]+\}/g, '') + '>';
});
content = content.replace(/<\/motion\.button>/g, '</button>');

content = content.replace(/<motion\.circle([^>]*)>/g, (match, g1) => {
    return '<circle' + g1
        .replace(/initial=\{[^}]+\}/g, '')
        .replace(/animate=\{[^}]+\}/g, '')
        .replace(/transition=\{[^}]+\}/g, '') + '>';
});

fs.writeFileSync(path, content, 'utf8');
console.log('done');
