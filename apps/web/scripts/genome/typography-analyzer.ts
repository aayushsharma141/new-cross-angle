import fs from 'fs/promises';
import path from 'path';
import { GenomeFinding, Verdict } from './types.js';

interface TypographicCluster {
  classes: string;
  count: number;
  locations: string[];
}

/**
 * Analyzes typography and rhythm patterns in the codebase to extract Design Intent.
 */
export async function analyzeTypography(): Promise<GenomeFinding[]> {
  console.log("🔍 Mining Typography & Rhythm...");
  const srcDir = path.join(process.cwd(), 'apps/web/src');
  const clusters = new Map<string, TypographicCluster>();

  await walkDir(srcDir, async (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract classNames (simplified regex for both standard and template literal classNames)
    const classNameRegex = /className(?:Name)?=(?:["']([^"']+)["']|{`([^`]+)`})/g;
    let match;
    while ((match = classNameRegex.exec(content)) !== null) {
      const classString = (match[1] || match[2]).replace(/\s+/g, ' ');
      
      // Extract typographic utilities
      const typoClasses = classString.split(' ').filter(c => 
        c.startsWith('text-') || 
        c.startsWith('font-') || 
        c.startsWith('tracking-') || 
        c.startsWith('leading-')
      ).sort().join(' ');

      if (typoClasses) {
        if (!clusters.has(typoClasses)) {
          clusters.set(typoClasses, { classes: typoClasses, count: 0, locations: [] });
        }
        const cluster = clusters.get(typoClasses)!;
        cluster.count++;
        if (!cluster.locations.includes(filePath) && cluster.locations.length < 5) {
          cluster.locations.push(filePath.replace(process.cwd(), ''));
        }
      }
    }
  });

  // Convert clusters to findings based on heuristic intent mapping
  const findings: GenomeFinding[] = [];
  
  for (const [classes, cluster] of clusters.entries()) {
    // Determine Intent based on properties (Heuristics for architectural mapping)
    let intent = "Body";
    let confidence = 50;
    let verdict: Verdict = 'KEEP';
    let target = 'typography.body';

    if (classes.includes('text-[36px]') || classes.includes('text-4xl') || classes.includes('text-5xl')) {
      intent = "Display Hero";
      confidence = cluster.count > 5 ? 98 : 75;
      verdict = 'MERGE';
      target = 'typography.hero';
    } else if (classes.includes('text-[28px]') || classes.includes('text-3xl') || classes.includes('text-2xl')) {
      intent = "Display Section";
      confidence = cluster.count > 10 ? 95 : 80;
      verdict = 'MERGE';
      target = 'typography.section';
    } else if (classes.includes('tracking-widest') || classes.includes('uppercase') || classes.includes('text-[10px]') || classes.includes('text-[9px]') || classes.includes('text-[12px] font-mono')) {
      intent = "Section Label / Metadata";
      confidence = cluster.count > 15 ? 99 : 85;
      verdict = 'MERGE';
      target = 'typography.label';
    } else if (classes.includes('text-sm') || classes.includes('text-[13px]')) {
      intent = "Caption / Secondary";
      confidence = cluster.count > 20 ? 90 : 70;
      verdict = 'MERGE';
      target = 'typography.caption';
    } else if (cluster.count === 1) {
      intent = "Anomalous Typography";
      confidence = 100;
      verdict = 'REMOVE';
      target = 'typography.body';
    }

    // Confidence decay based on conflicting permutations (simulated via strict exact class groupings)
    if (cluster.count < 3 && verdict !== 'REMOVE') {
      confidence -= 20; // Drift penalty for rare variations
    }

    findings.push({
      observation: `Typographic combination: \`${classes}\``,
      intent,
      evidence: {
        occurrences: cluster.count,
        locations: cluster.locations
      },
      confidence,
      verdict,
      migrationTarget: target,
      constitutionLaws: ['Use hierarchical typographic scale', 'Avoid hardcoded sizes']
    });
  }

  // Sort by occurrences
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
