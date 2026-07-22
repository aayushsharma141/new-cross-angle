import fs from 'fs/promises';
import path from 'path';
import { GenomeFinding, Verdict } from './types.js';

interface Context {
  tag: string;
  classes: string;
  filePath: string;
}

export async function analyzeColors(_previousFindings: { 
  typography: GenomeFinding[], 
  layouts: GenomeFinding[], 
  components: GenomeFinding[], 
  motion: GenomeFinding[] 
}): Promise<GenomeFinding[]> {
  console.log("🎨 Mining Colors & Materials (Contextually)...");
  const srcDir = path.join(process.cwd(), 'apps/web/src');
  const contextMap = new Map<string, Context[]>();

  await walkDir(srcDir, async (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    const content = await fs.readFile(filePath, 'utf-8');
    
    const tagRegex = /<([a-zA-Z0-9]+)[^>]*className=(?:["']([^"']+)["']|{`([^`]+)`})/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1];
      const classString = (match[2] || match[3]).replace(/\s+/g, ' ');
      
      const colorClasses = classString.split(' ').filter(c => 
        (c.startsWith('text-') && !c.includes('text-[')) || // heuristic for colors vs sizes
        c.startsWith('bg-') || c.startsWith('border-') || c.startsWith('ring-') ||
        c.startsWith('fill-') || c.startsWith('stroke-') ||
        c.includes('backdrop-blur') || c.startsWith('opacity-')
      ).sort().join(' ');

      // Need to filter out layout/typography specifics that clash, e.g., text-sm, text-center
      const filteredColorClasses = colorClasses.split(' ').filter(c => 
        !['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-center', 'text-left', 'text-right', 'text-justify'].includes(c)
      ).join(' ');

      if (filteredColorClasses) {
        if (!contextMap.has(filteredColorClasses)) {
          contextMap.set(filteredColorClasses, []);
        }
        contextMap.get(filteredColorClasses)!.push({ tag, classes: classString, filePath });
      }
    }
  });

  const findings: GenomeFinding[] = [];
  
  for (const [classes, contexts] of contextMap.entries()) {
    let intent = "Unclassified Color Assignment";
    let confidence = 40;
    let verdict: Verdict = 'KEEP';
    let target = 'color.unknown';

    // Contextual evaluation! We know what tag and what *other* classes this has.
    const isSurface = classes.includes('bg-') && !classes.includes('bg-transparent');
    const isText = classes.includes('text-');
    const hasBlur = classes.includes('backdrop-blur');
    const isInteractive = contexts.some(c => c.tag === 'button' || c.tag === 'a' || c.classes.includes('hover:'));
    
    if (isSurface && hasBlur) {
      intent = "Glass Material Overlay";
      confidence = contexts.length > 2 ? 95 : 80;
      verdict = 'MERGE';
      target = 'material.glass';
    } else if (isSurface && isInteractive) {
      intent = "Action Surface";
      confidence = contexts.length > 3 ? 98 : 85;
      verdict = 'MERGE';
      target = 'surface.action';
    } else if (isSurface && contexts.some(c => c.tag === 'section' || c.tag === 'main')) {
      intent = "Page Background";
      confidence = contexts.length > 1 ? 99 : 80;
      verdict = 'MERGE';
      target = 'surface.primary';
    } else if (isText && contexts.some(c => c.classes.includes('font-semibold') || c.tag === 'h1' || c.tag === 'h2')) {
      intent = "Primary Text";
      confidence = contexts.length > 5 ? 95 : 75;
      verdict = 'MERGE';
      target = 'text.primary';
    } else if (isText && (classes.includes('text-gray') || classes.includes('text-neutral') || classes.includes('text-zinc'))) {
      intent = "Secondary Text";
      confidence = contexts.length > 5 ? 95 : 75;
      verdict = 'MERGE';
      target = 'text.secondary';
    } else if (contexts.length === 1) {
      intent = "Anomalous Color Pattern";
      confidence = 100;
      verdict = 'REMOVE';
      target = 'surface.primary'; 
    }

    if (intent !== "Unclassified Color Assignment" || contexts.length > 5) {
      findings.push({
        observation: `Color/Material combination: \`${classes}\` (often on <${contexts[0].tag}>)`,
        intent,
        evidence: {
          occurrences: contexts.length,
          locations: Array.from(new Set(contexts.map(c => c.filePath.replace(process.cwd(), '')))).slice(0, 5)
        },
        confidence,
        verdict,
        migrationTarget: target,
        constitutionLaws: ['Use semantic tokens for color', 'Materials dictate z-depth and blur']
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
