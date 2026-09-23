import { describe, it, expect } from 'vitest';
import { leadSchema } from './validations';

const phoneOk = (phone: string) =>
  leadSchema.safeParse({ name: 'Test Lead', email: 'a@b.co', phone }).success;

describe('leadSchema.phone', () => {
  it.each([
    '+919876543210',
    '9876543210',
    '+91 98765 43210',
    '+91-98765-43210',
    '(0657) 2345678',
    '+1 (555) 123-4567',
  ])('accepts %s', (phone) => {
    expect(phoneOk(phone)).toBe(true);
  });

  it.each(['12', '1-2', 'abc', '1234567890123456', '98765abc10'])('rejects %s', (phone) => {
    expect(phoneOk(phone)).toBe(false);
  });

  it('allows the field to be omitted', () => {
    expect(leadSchema.safeParse({ name: 'Test Lead', email: 'a@b.co' }).success).toBe(true);
  });
});
