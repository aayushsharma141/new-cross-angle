import fs from 'fs';

const filePath = 'src/components/discovery/ResultsReveal.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Fix luxury -> structure
code = code.replace(/scores\.luxury/g, 'scores.structure');

// 2. Fix DOM element types
code = code.replace(/const stepMap = Array\.from\(document\.querySelectorAll\('\.step-label'\)\)\.map\((.*?) => (.*?)\.offsetTop\);/g,
    "const stepMap = Array.from(document.querySelectorAll('.step-label')).map($1 => ($2 as HTMLElement).offsetTop);");

code = code.replace(/const totalHeight = document\.querySelector\('\.s6-content'\)\.offsetHeight;/g,
    "const totalHeight = (document.querySelector('.s6-content') as HTMLElement).offsetHeight;");

code = code.replace(/document\.addEventListener\('mousemove', e => {/g,
    "document.addEventListener('mousemove', (e: MouseEvent) => {");

code = code.replace(/cursor\.style\.left = mx \+ 'px';\s*cursor\.style\.top = my \+ 'px';/g,
    "(cursor as HTMLElement).style.left = mx + 'px';\n      (cursor as HTMLElement).style.top = my + 'px';");

code = code.replace(/ring\.style\.transform = `translate\(\$\{rx\}px, \$\{ry\}px\)`/g,
    "(ring as HTMLElement).style.transform = `translate(${rx}px, ${ry}px)`");

code = code.replace(/activeItem\.style\.background = '#222';/g,
    "(activeItem as HTMLElement).style.background = '#222';");

code = code.replace(/document\.querySelector\('\.s2-bg'\)\.style\.backgroundColor = '#040404';/g,
    "(document.querySelector('.s2-bg') as HTMLElement).style.backgroundColor = '#040404';");

// 3. Fix onclick -> onClick
code = code.replace(/onclick="/g, 'onClick="');

// 4. Update the missing type mapping if there's any onClick literal, it might complain about string.
// wait, if it's onClick="...", React will complain it expects a function.
// Let's strip those inline onclick handlers and convert to onClick={() => {}} or remove if unnecessary.
// Example: <div ... onclick="this.classList.toggle('sel')">
code = code.replace(/onclick="([^"]+)"/ig, (match, p1) => {
    return `onClick={(e) => e.currentTarget.classList.toggle('sel')}`;
});

fs.writeFileSync(filePath, code);
console.log('Fixed TS errors');
