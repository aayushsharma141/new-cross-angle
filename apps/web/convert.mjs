import fs from 'fs';

const htmlPath = 'spatial-identity-os.html';
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Extract CSS
const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/i);
let cssContent = cssMatch ? cssMatch[1] : '';

// Quick adaptations to CSS
cssContent = cssContent.replace(/body {([\s\S]*?)}/g, '.blueprint-page-wrapper {\n$1\nmin-height: 100vh;\n}');
fs.writeFileSync('src/pages/BlueprintPage.css', cssContent);

// Extract Scripts
let scriptContent = '';
const scripts = [...htmlContent.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
scripts.forEach(s => {
    scriptContent += s[1] + '\n';
});

// Extract Body Content
const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyHtml = bodyMatch ? bodyMatch[1] : '';

// Remove all script tags from body
bodyHtml = bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// Process HTML to JSX
let jsxContent = bodyHtml
    .replace(/ class="/g, ' className="')
    .replace(/ for="/g, ' htmlFor="')
    .replace(/<img(.*?)>/g, (match, attrs) => {
        if (match.endsWith('/>')) return match;
        return `<img${attrs} />`;
    })
    .replace(/<input(.*?)>/g, (match, attrs) => {
        if (match.endsWith('/>')) return match;
        return `<input${attrs} />`;
    })
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    .replace(/<source(.*?)>/g, (match, attrs) => {
        if (match.endsWith('/>')) return match;
        return `<source${attrs} />`;
    })
    .replace(/<col(.*?)>/g, (match, attrs) => {
        if (match.endsWith('/>')) return match;
        return `<col${attrs} />`;
    })
    // SVG attributes that need camelCase in JSX
    .replace(/ stroke-width=/g, ' strokeWidth=')
    .replace(/ stroke-linecap=/g, ' strokeLinecap=')
    .replace(/ stroke-linejoin=/g, ' strokeLinejoin=')
    .replace(/ fill-rule=/g, ' fillRule=')
    .replace(/ clip-rule=/g, ' clipRule=')
    .replace(/ stroke-dasharray=/g, ' strokeDasharray=')
    .replace(/ stroke-miterlimit=/g, ' strokeMiterlimit=')
    // convert inline styles
    .replace(/ style="([^"]+)"/g, (match, styleString) => {
        let styleObj = {};
        styleString.split(';').forEach(rule => {
            if (!rule.trim()) return;
            let parts = rule.split(':');
            if (parts.length < 2) return;
            let key = parts[0];
            let value = parts.slice(1).join(':'); // handle e.g. url(...)
            let camelCaseKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            styleObj[camelCaseKey] = value.trim();
        });
        return ` style={${JSON.stringify(styleObj)}}`;
    })
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}'); // comments

const reactComponent = `import React, { useEffect, useRef } from 'react';
import './BlueprintPage.css';
import { Link } from "react-router-dom";

export default function BlueprintPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Ensure DOM is ready, then run scripts
        const timer = setTimeout(() => {
            try {
                ${scriptContent.split('\n').map(line => '                ' + line).join('\n')}
            } catch (e) {
                console.error("Error executing blueprint scripts", e);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="blueprint-page-wrapper bg-[#040404] text-[#E0E0E0] min-h-screen" ref={containerRef}>
            ${jsxContent}
        </div>
    );
}
`;

fs.writeFileSync('src/pages/BlueprintPage.tsx', reactComponent);
console.log('Conversion successful: saved BlueprintPage.css and BlueprintPage.tsx');
