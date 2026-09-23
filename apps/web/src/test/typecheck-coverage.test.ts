import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Regression guard: `npm run typecheck --workspace=web` (the CI type-check step)
 * used to be a bare `tsc --noEmit`. tsconfig.json is a solution-style config
 * (`"files": []` + references), and plain `tsc -p` doesn't follow references,
 * so it checked zero files and always passed.
 *
 * The invariant: the script names each config it checks, and every one of
 * them actually includes source files.
 */

const WEB = path.resolve(__dirname, '../../');
const readJson = (p: string) =>
  JSON.parse(
    fs
      .readFileSync(path.join(WEB, p), 'utf-8')
      // tsconfig allows comments; strip block and line comments before parsing.
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
  );

describe('typecheck script coverage', () => {
  const script: string = readJson('package.json').scripts.typecheck;
  const configs = [...script.matchAll(/-p\s+(\S+)/g)].map((m) => m[1]);

  it('targets explicit projects rather than the solution tsconfig', () => {
    expect(configs, `typecheck script "${script}" passes no -p config`).not.toHaveLength(0);
    expect(configs).toEqual(expect.arrayContaining(['tsconfig.app.json', 'tsconfig.node.json']));
  });

  it('every targeted config includes source files', () => {
    for (const cfg of configs) {
      const json = readJson(cfg);
      const entries = [...(json.include ?? []), ...(json.files ?? [])];
      expect(entries, `${cfg} includes no files, so tsc checks nothing`).not.toHaveLength(0);
    }
  });

  it('covers every project the solution tsconfig references', () => {
    const refs: string[] = (readJson('tsconfig.json').references ?? []).map(
      (r: { path: string }) => path.basename(r.path)
    );
    const missing = refs.filter((r) => !configs.includes(r));
    expect(missing, `typecheck skips referenced projects: ${missing.join(', ')}`).toEqual([]);
  });
});
