import { describe, it, expect } from 'vitest';
import { toCsv } from './analytics-utils';

const cells = (csv: string) => csv.split('\n')[1];

describe('toCsv', () => {
  it('quotes and escapes embedded quotes', () => {
    expect(cells(toCsv(['Name'], [['Ravi "R" Kumar']]))).toBe('"Ravi ""R"" Kumar"');
  });

  it.each(['=HYPERLINK("http://x")', '+919876543210', '-2+3', '@SUM(A1)', '\tcmd'])(
    'neutralises formula-leading cell %j',
    (value) => {
      expect(cells(toCsv(['V'], [[value]]))).toMatch(/^"'/);
    }
  );

  it('leaves ordinary text untouched', () => {
    expect(cells(toCsv(['V'], [['Jamshedpur']]))).toBe('"Jamshedpur"');
  });
});
