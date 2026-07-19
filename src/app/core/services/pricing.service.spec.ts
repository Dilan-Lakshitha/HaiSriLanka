import { describe, expect, it } from 'vitest';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const service = new PricingService();
  const pricing = { '1': 550, '2': 420, '3': 390, '4': 360, '5': 340 };

  it('returns per-person price for group size', () => {
    expect(service.getPricePerPerson(pricing, 2)).toBe(420);
  });

  it('computes total for travelers', () => {
    expect(service.getTotal(pricing, 3)).toBe(1170);
  });

  it('clamps travelers between 1 and 5', () => {
    expect(service.getPricePerPerson(pricing, 0)).toBe(550);
    expect(service.getPricePerPerson(pricing, 9)).toBe(340);
  });
});
