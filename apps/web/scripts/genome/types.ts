export type Verdict = 'KEEP' | 'MERGE' | 'REMOVE' | 'DEPRECATE';

export interface Evidence {
  occurrences: number;
  locations?: string[];
  context?: string;
}

export interface GenomeFinding {
  observation: string;
  intent: string;
  evidence: Evidence;
  confidence: number; // 0 to 100
  verdict: Verdict;
  migrationTarget?: string;
  constitutionLaws?: string[];
}

export interface DesignGenome {
  version: string;
  timestamp: string;
  driftScore: number;
  complianceScore: number;
  families: {
    colors: GenomeFinding[];
    spacing: GenomeFinding[];
    typography: GenomeFinding[];
    motion: GenomeFinding[];
    layouts: GenomeFinding[];
    components: GenomeFinding[];
    rhythm: GenomeFinding[];
    materials: GenomeFinding[];
    environments: GenomeFinding[];
  };
}
