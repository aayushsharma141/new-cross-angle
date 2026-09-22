import fs from 'fs/promises';
import path from 'path';
import { GenomeFinding, Verdict } from './types.js';

interface Context {
  tag: string;
  classes: string;
  filePath: string;
}

export async function analyzeMotion(_previousFindings: { components: GenomeFinding[] }): Promise<GenomeFinding[]> {
  console.log("🎬 Mining Motion & Interaction...");
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
      
      const motionClasses = classString.split(' ').filter(c => 
        c.startsWith('transition') || c.startsWith('duration-') || 
        c.startsWith('ease-') || c.includes('hover:') || c.includes('focus:') || c.includes('active:') ||
        c.includes('group-hover:')
      ).sort().join(' ');

      if (motionClasses) {
        if (!contextMap.has(motionClasses)) {
          contextMap.set(motionClasses, []);
        }
        contextMap.get(motionClasses)!.push({ tag, classes: classString, filePath });
      }
    }
  });

  const findings: GenomeFinding[] = [];
  
  for (const [classes, contexts] of contextMap.entries()) {
    let intent = "Generic Transition";
    let confidence = 50;
    let verdict: Verdict = 'KEEP';
    let target = 'motion.standard';

    const hasHoverScale = classes.includes('hover:scale') || classes.includes('active:scale');
    const hasHoverColors = classes.includes('hover:bg') || classes.includes('hover:text');
    const hasGroupHover = classes.includes('group-hover:');

    if (hasHoverScale && (contexts.some(c => c.tag === 'button' || c.tag === 'a'))) {
      intent = "Interactive Push/Scale";
      confidence = contexts.length > 2 ? 98 : 80;
      verdict = 'MERGE';
      target = 'motion.interaction.push';
    } else if (hasHoverColors && contexts.some(c => c.tag === 'button' || c.tag === 'a')) {
      intent = "Interactive Highlight";
      confidence = contexts.length > 3 ? 95 : 75;
      verdict = 'MERGE';
      target = 'motion.interaction.highlight';
    } else if (hasGroupHover) {
      intent = "Contextual Reveal";
      confidence = contexts.length > 2 ? 90 : 70;
      verdict = 'MERGE';
      target = 'motion.reveal';
    } else if (contexts.length === 1) {
      intent = "Anomalous Motion State";
      confidence = 100;
      verdict = 'REMOVE';
      target = 'motion.standard';
    }

    if (intent !== "Generic Transition" || contexts.length > 3) {
      findings.push({
        observation: `Motion combination: \`${classes}\` (often on <${contexts[0].tag}>)`,
        intent,
        evidence: {
          occurrences: contexts.length,
          locations: Array.from(new Set(contexts.map(c => c.filePath.replace(process.cwd(), '')))).slice(0, 5)
        },
        confidence,
        verdict,
        migrationTarget: target,
        constitutionLaws: ['Provide immediate kinetic feedback', 'Avoid sluggish transitions (>200ms for UI)']
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
