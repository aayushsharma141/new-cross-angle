import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

describe('Architecture Fitness Tests', () => {
  const allFiles = getAllFiles(SRC_DIR);

  it('Contract: Repositories and Services must not import React or React DOM', () => {
    const serviceFiles = allFiles.filter(
      (f) =>
        (f.includes(path.join('services', 'media')) || f.includes('Repository')) &&
        !f.endsWith('.test.ts') &&
        !f.endsWith('.test.tsx')
    );

    const violations: string[] = [];

    serviceFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      if (
        content.match(/import\s+.*from\s+['"]react['"]/) ||
        content.match(/import\s+.*from\s+['"]react-dom['"]/)
      ) {
        violations.push(path.relative(SRC_DIR, file));
      }
    });

    expect(violations).toEqual([]);
  });

  it('Contract: UI Components must not import storage providers directly', () => {
    const componentFiles = allFiles.filter(
      (f) => f.includes(path.join('src', 'components')) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx')
    );

    const violations: string[] = [];

    componentFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('services/media/providers/')) {
        violations.push(path.relative(SRC_DIR, file));
      }
    });

    expect(violations).toEqual([]);
  });

  it('Contract: MediaRepository & UploadOrchestrator depend on StorageGateway interface, not concrete providers', () => {
    const repoFile = allFiles.find((f) => f.endsWith('MediaRepository.ts'));
    expect(repoFile).toBeDefined();

    if (repoFile) {
      const content = fs.readFileSync(repoFile, 'utf-8');
      expect(content).not.toContain('ImageKitProvider');
      expect(content).not.toContain('SupabaseProvider');
    }

    const orchestratorFile = allFiles.find((f) => f.endsWith('UploadOrchestrator.ts'));
    expect(orchestratorFile).toBeDefined();
    if (orchestratorFile) {
      const content = fs.readFileSync(orchestratorFile, 'utf-8');
      expect(content).toContain('StorageGateway');
    }
  });

  it('Contract: Shim facades must remain thin (< 50 LOC) and strictly re-export', () => {
    const apiShim = path.join(SRC_DIR, 'lib', 'api.ts');
    const mediaShim = path.join(SRC_DIR, 'services', 'MediaService.ts');

    if (fs.existsSync(apiShim)) {
      const content = fs.readFileSync(apiShim, 'utf-8');
      const loc = content.split('\n').length;
      expect(loc).toBeLessThan(50);
      expect(content).toContain('export * from');
      expect(content).not.toContain('async function');
    }

    if (fs.existsSync(mediaShim)) {
      const content = fs.readFileSync(mediaShim, 'utf-8');
      const loc = content.split('\n').length;
      expect(loc).toBeLessThan(50);
      expect(content).toContain('export * from');
    }
  });

  it('Contract: Concrete Storage Providers must implement StorageGateway contract methods (upload & delete)', () => {
    const providerDir = path.join(SRC_DIR, 'services', 'media', 'providers');
    if (fs.existsSync(providerDir)) {
      const providers = fs.readdirSync(providerDir).filter(f => f.endsWith('Provider.ts'));
      expect(providers.length).toBeGreaterThan(0);

      providers.forEach((file) => {
        const content = fs.readFileSync(path.join(providerDir, file), 'utf-8');
        expect(content).toContain('upload');
        expect(content).toContain('delete');
      });
    }
  });

  it('Contract: Services and Repositories must not import Vite bundler APIs', () => {
    const domainFiles = allFiles.filter(
      (f) => (f.includes('services') || f.includes('repositories')) && !f.endsWith('.test.ts')
    );

    domainFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain("from 'vite'");
      expect(content).not.toContain('from "vite"');
    });
  });

  it('Contract: Feature code must not access or store auth tokens in localStorage/sessionStorage', () => {
    const featureFiles = allFiles.filter(
      (f) =>
        f.includes(path.join('src', 'components')) ||
        f.includes(path.join('src', 'services')) ||
        f.includes(path.join('src', 'hooks'))
    );

    const tokenLeakageViolations: string[] = [];
    featureFiles.forEach((file) => {
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return;
      const content = fs.readFileSync(file, 'utf-8');
      if (
        content.includes("localStorage.setItem('token'") ||
        content.includes("localStorage.setItem('supabase.auth.token'") ||
        content.includes("sessionStorage.setItem('token'")
      ) {
        tokenLeakageViolations.push(path.relative(SRC_DIR, file));
      }
    });

    expect(tokenLeakageViolations).toEqual([]);
  });

  it('Contract: PostgreSQL database migrations must enforce Row-Level Security on all public tables', () => {
    const migrationsDir = path.resolve(SRC_DIR, '../../supabase/migrations');
    if (!fs.existsSync(migrationsDir)) return;

    const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
    const createTableRegex = /CREATE TABLE (?:IF NOT EXISTS )?public\.([a-z_]+)/gi;
    const enableRlsRegex = /ALTER TABLE public\.([a-z_]+) ENABLE ROW LEVEL SECURITY/gi;

    const declaredTables = new Set<string>();
    const rlsProtectedTables = new Set<string>();

    migrationFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      let match;
      while ((match = createTableRegex.exec(content)) !== null) {
        declaredTables.add(match[1]);
      }
      while ((match = enableRlsRegex.exec(content)) !== null) {
        rlsProtectedTables.add(match[1]);
      }
    });

    const unshieldedTables = [...declaredTables].filter((table) => !rlsProtectedTables.has(table));
    expect(
      unshieldedTables,
      `Tables found without explicit Row-Level Security: ${unshieldedTables.join(', ')}`
    ).toEqual([]);
  });
});

