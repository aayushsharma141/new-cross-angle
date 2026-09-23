import { describe, it, expect, vi, beforeEach } from 'vitest';

const ranges: Array<[number, number]> = [];
let totalRows = 0;

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    let from = 0;
    let to = 0;
    const q = {
      select: () => q,
      order: () => q,
      eq: () => q,
      range: (a: number, b: number) => { from = a; to = b; ranges.push([a, b]); return q; },
      then: (resolve: (r: { data: { id: string }[]; error: null }) => void) => {
        const count = Math.max(0, Math.min(to, totalRows - 1) - from + 1);
        resolve({ data: Array.from({ length: count }, (_, i) => ({ id: String(from + i) })), error: null });
      },
    };
    return q;
  };
  return { supabase: { from: () => builder() } };
});

import { SupabaseLeadRepo } from './SupabaseLeadRepo';

describe('SupabaseLeadRepo.getLeads', () => {
  beforeEach(() => { ranges.length = 0; });

  it('returns every lead past the 1000-row response cap', async () => {
    totalRows = 2345;
    const leads = await new SupabaseLeadRepo().getLeads();
    expect(leads).toHaveLength(2345);
    expect(ranges).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });

  it('makes one request when everything fits in a page', async () => {
    totalRows = 60;
    expect(await new SupabaseLeadRepo().getLeads()).toHaveLength(60);
    expect(ranges).toHaveLength(1);
  });

  it('stops on an exact page boundary', async () => {
    totalRows = 1000;
    expect(await new SupabaseLeadRepo().getLeads()).toHaveLength(1000);
    expect(ranges).toEqual([[0, 999], [1000, 1999]]);
  });
});
