/**
 * Migration Safety Check
 * 
 * Asserts zero-downtime database migration constraints.
 * 
 * Rules enforced:
 * 1. No DROP COLUMN (columns must be deprecated via application logic first)
 * 2. No RENAME COLUMN (add new column, sync data, then switch reads/writes)
 * 3. No adding NOT NULL columns without a default value
 * 
 * Example usage:
 * npx ts-node scripts/checks/migration-safety.ts ./supabase/migrations
 */

export function checkMigrationSafety(migrationSql: string): string[] {
  const violations: string[] = [];
  
  if (/DROP\s+COLUMN/i.test(migrationSql)) {
    violations.push('❌ DROP COLUMN detected. Use zero-downtime deprecation pattern instead.');
  }
  
  if (/RENAME\s+COLUMN/i.test(migrationSql)) {
    violations.push('❌ RENAME COLUMN detected. Add new column, dual-write, then backfill instead.');
  }

  // Naive check for NOT NULL without DEFAULT
  if (/(ADD|ADD\s+COLUMN)[^;]+NOT\s+NULL/i.test(migrationSql) && !/DEFAULT/i.test(migrationSql)) {
    violations.push('❌ Adding NOT NULL column without a DEFAULT value will lock the table.');
  }

  return violations;
}
