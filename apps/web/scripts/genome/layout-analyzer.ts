import fs from 'fs/promises';
import path from 'path';
import { GenomeFinding, Verdict } from './types.js';

interface LayoutCluster {
  classes: string;
  count: number;
  locations: string[];
}

/**
 * Analyzes layout and composition patterns to extract structural Design Intents.
 */
export async function analyzeLayouts(): Promise<GenomeFinding[]> {
  console.log("📐 Mining Layout & Composition...");
  const srcDir = path.join(process.cwd(), 'apps/web/src');
  const clusters = new Map<string, LayoutCluster>();

  await walkDir(srcDir, async (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    const classNameRegex = /className(?:Name)?=(?:["']([^"']+)["']|{`([^`]+)`})/g;
    let match;
    while ((match = classNameRegex.exec(content)) !== null) {
      const classString = (match[1] || match[2]).replace(/\s+/g, ' ');
      
      const layoutClasses = classString.split(' ').filter(c => 
        c.startsWith('flex') || c.startsWith('grid') || 
        c.startsWith('items-') || c.startsWith('justify-') || 
        c.startsWith('gap-') || c.startsWith('max-w-') ||
        c === 'absolute' || c === 'relative' || c === 'fixed' || c === 'inset-0' ||
        c.startsWith('w-') || c.startsWith('h-') || c.startsWith('col-')
      ).sort().join(' ');

      if (layoutClasses) {
        if (!clusters.has(layoutClasses)) {
          clusters.set(layoutClasses, { classes: layoutClasses, count: 0, locations: [] });
        }
        const cluster = clusters.get(layoutClasses)!;
        cluster.count++;
        if (!cluster.locations.includes(filePath) && cluster.locations.length < 5) {
          cluster.locations.push(filePath.replace(process.cwd(), ''));
        }
      }
    }
  });

  const findings: GenomeFinding[] = [];
  
  for (const [classes, cluster] of clusters.entries()) {
    let intent = "Unclassified Structure";
    let confidence = 50;
    let verdict: Verdict = 'KEEP';
    let target = 'layout.container';

    // Layout Architecture Heuristics
    if ((classes.includes('max-w-7xl') || classes.includes('max-w-5xl') || classes.includes('max-w-screen-xl')) && classes.includes('mx-auto')) {
      intent = "Page Container (Centered)";
      confidence = cluster.count > 2 ? 95 : 80;
      verdict = 'MERGE';
      target = 'layout.page-container';
    } else if (classes.includes('grid') && (classes.includes('grid-cols-2') || classes.includes('grid-cols-3'))) {
      intent = "Split Panel / Grid Layout";
      confidence = cluster.count > 3 ? 90 : 75;
      verdict = 'MERGE';
      target = 'layout.grid';
    } else if (classes.includes('flex') && classes.includes('flex-col') && classes.includes('gap-')) {
      intent = "Vertical Stack";
      confidence = cluster.count > 10 ? 98 : 85;
      verdict = 'MERGE';
      target = 'layout.v-stack';
    } else if (classes.includes('flex') && classes.includes('items-center') && classes.includes('gap-')) {
      intent = "Inline Cluster";
      confidence = cluster.count > 15 ? 99 : 85;
      verdict = 'MERGE';
      target = 'layout.h-stack';
    } else if ((classes.includes('absolute') || classes.includes('fixed')) && classes.includes('inset-0')) {
      intent = "Fullscreen Overlay";
      confidence = cluster.count > 2 ? 95 : 70;
      verdict = 'MERGE';
      target = 'layout.overlay';
    } else if (cluster.count === 1) {
      intent = "Anomalous Layout Structure";
      confidence = 100;
      verdict = 'REMOVE';
      target = 'layout.v-stack'; // Default to a standard stack when refactoring
    }

    if (cluster.count < 2 && verdict !== 'REMOVE') {
      confidence -= 15;
    }

    // Only add significant layouts to the genome (skip very basic stuff unless anomalous)
    if (intent !== "Unclassified Structure" || cluster.count > 5) {
      findings.push({
        observation: `Layout combination: \`${classes}\``,
        intent,
        evidence: {
          occurrences: cluster.count,
          locations: cluster.locations
        },
        confidence,
        verdict,
        migrationTarget: target,
        constitutionLaws: ['Favor structural primitives (Stack/Cluster)', 'Avoid ad-hoc absolute positioning']
      });
    }
  }

  return findings.sort((a, b) => 
    b.evidence.occurrences !== a.evidence.occurrences 
      ? b.evidence.occurrences - a.evidence.occurrences 
      : a.observation.localeCompare(b.observation)
  );
}

// Helper to traverse directories
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
