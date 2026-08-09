import { describe, expect, it } from 'vitest';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const service = new PricingService();
  const pricing = { '1': 550, '2': 420, '3': 390, '4': 360, '5': 340, '6': 320 };

  it('returns per-person price for group size', () => {
    expect(service.getPricePerPerson(pricing, 2)).toBe(420);
    expect(service.getPricePerPerson(pricing, 6)).toBe(320);
  });

  it('computes total for travelers', () => {
    expect(service.getTotal(pricing, 3)).toBe(1170);
    expect(service.getTotal(pricing, 6)).toBe(1920);
  });

  it('clamps travelers between 1 and 6', () => {
    expect(service.getPricePerPerson(pricing, 0)).toBe(550);
    expect(service.getPricePerPerson(pricing, 9)).toBe(320);
  });

  it('falls back to 5-pax rate when 6 is missing', () => {
    const withoutSix = { '1': 550, '2': 420, '3': 390, '4': 360, '5': 340, '6': 0 };
    expect(service.getPricePerPerson(withoutSix, 6)).toBe(340);
    expect(service.getTotal(withoutSix, 6)).toBe(2040);
  });
});
