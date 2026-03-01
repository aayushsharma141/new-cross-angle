import fs from 'fs';

const filePath = 'src/components/discovery/ResultsReveal.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Fix offsetTop / offsetHeight
code = code.replace(/s\.offsetTop/g, '(s as HTMLElement).offsetTop');
code = code.replace(/s\.offsetHeight/g, '(s as HTMLElement).offsetHeight');

// 2. Fix Event -> MouseEvent in mousemove
code = code.replace(/card\.addEventListener\('mousemove', e => {/g, "card.addEventListener('mousemove', (e: Event) => { const evt = e as MouseEvent;");
code = code.replace(/e\.clientX/g, 'evt.clientX');
code = code.replace(/e\.clientY/g, 'evt.clientY');

// we also have document addEventListener mousemove for the cursor
// Wait, we fixed that earlier: document.addEventListener('mousemove', (e: MouseEvent) => {
// We should revert evt.clientX for that specific one if it broke.
// Actually, earlier I did: `document.addEventListener('mousemove', (e: MouseEvent) => {`
// So e.clientX is fine there. If I replace e.clientX with evt.clientX blindly, it will break the document one.
// Let's do it precisely:

code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/s\.offsetTop/g, '(s as HTMLElement).offsetTop');
code = code.replace(/s\.offsetHeight/g, '(s as HTMLElement).offsetHeight');

code = code.replace(/card\.addEventListener\('mousemove', e => {[\s\S]*?const x = \(e\.clientX/g,
    "card.addEventListener('mousemove', (e: any) => {\n            const r = card.getBoundingClientRect();\n            const x = (e.clientX");

code = code.replace(/card\.style\.transform/g, '(card as HTMLElement).style.transform');
code = code.replace(/prog\.style\.width/g, '(prog as HTMLElement).style.width');
code = code.replace(/c\.style\.strokeDashoffset/g, '(c as HTMLElement).style.strokeDashoffset');

fs.writeFileSync(filePath, code);
console.log('Fixed TS errors Part 2');
