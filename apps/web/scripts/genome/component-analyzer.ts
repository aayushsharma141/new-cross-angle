import fs from 'fs/promises';
import path from 'path';
import { GenomeFinding, Verdict } from './types.js';

interface Context {
  tag: string;
  classes: string;
  filePath: string;
}

export async function analyzeComponents(_previousFindings: { typography: GenomeFinding[], layouts: GenomeFinding[] }): Promise<GenomeFinding[]> {
  console.log("🧩 Mining Components & Geometry...");
  const srcDir = path.join(process.cwd(), 'apps/web/src');
  const contextMap = new Map<string, Context[]>();

  await walkDir(srcDir, async (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Capture tag and className string
    const tagRegex = /<([a-zA-Z0-9]+)[^>]*className=(?:["']([^"']+)["']|{`([^`]+)`})/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1];
      const classString = (match[2] || match[3]).replace(/\s+/g, ' ');
      
      const componentClasses = classString.split(' ').filter(c => 
        c.startsWith('rounded') || c.startsWith('border') || 
        c.startsWith('shadow') || c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-')
      ).sort().join(' ');

      if (componentClasses) {
        if (!contextMap.has(componentClasses)) {
          contextMap.set(componentClasses, []);
        }
        contextMap.get(componentClasses)!.push({ tag, classes: classString, filePath });
      }
    }
  });

  const findings: GenomeFinding[] = [];
  
  for (const [classes, contexts] of contextMap.entries()) {
    let intent = "Generic Box";
    let confidence = 50;
    let verdict: Verdict = 'KEEP';
    let target = 'component.box';

    // Contextual cross-referencing
    const hasButtonTag = contexts.some(c => c.tag.toLowerCase() === 'button');
    const hasInputTag = contexts.some(c => c.tag.toLowerCase() === 'input' || c.tag.toLowerCase() === 'select');
    const hasCardLayout = classes.includes('shadow') && classes.includes('rounded');

    if (hasButtonTag && (classes.includes('px-') || classes.includes('py-'))) {
      intent = "Action Button";
      confidence = contexts.length > 3 ? 98 : 85;
      verdict = 'MERGE';
      target = 'component.button';
    } else if (hasInputTag && classes.includes('border')) {
      intent = "Form Input";
      confidence = contexts.length > 2 ? 95 : 80;
      verdict = 'MERGE';
      target = 'component.input';
    } else if (hasCardLayout && contexts.some(c => c.tag === 'div' || c.tag === 'article')) {
      intent = "Surface Card";
      confidence = contexts.length > 5 ? 90 : 75;
      verdict = 'MERGE';
      target = 'component.card';
    } else if (contexts.length === 1) {
      intent = "Anomalous Geometry";
      confidence = 100;
      verdict = 'REMOVE';
      target = 'component.box';
    }

    if (intent !== "Generic Box" || contexts.length > 5) {
      findings.push({
        observation: `Geometry combination: \`${classes}\` (often on <${contexts[0].tag}>)`,
        intent,
        evidence: {
          occurrences: contexts.length,
          locations: Array.from(new Set(contexts.map(c => c.filePath.replace(process.cwd(), '')))).slice(0, 5)
        },
        confidence,
        verdict,
        migrationTarget: target,
        constitutionLaws: ['Maintain consistent interaction targets', 'Standardize radius families']
      });
    }
  }

  return findings.sort((a, b) => 
    b.evidence.occurrences !== a.evidence.occurrences 
      ? b.evidence.occurrences - a.evidence.occurrences 
      : a.observation.localeCompare(b.observation)
  );
}

async function walkDir(dir: string, callback: (path: string) => Promise<void>) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await walkDir(fullPath, callback);
    } else {
      await callback(fullPath);
    }
  }
}
