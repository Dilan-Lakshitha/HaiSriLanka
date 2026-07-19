import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeCtaComponent } from './home-cta.component';
import type { HomeCta } from '../../../../core/models';

const cta: HomeCta = {
  eyebrow: 'Begin',
  title: 'Plan',
  subtitle: 'Tell us',
  primaryCta: { label: 'Contact', path: 'contact' },
  secondaryCta: { label: 'Offers', path: 'special-offers' },
  image: {
    src: '/assets/images/placeholders/cta-journey.svg',
    alt: 'Journey',
    width: 1400,
    height: 800,
  },
};

describe('HomeCtaComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCtaComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeCtaComponent);
    fixture.componentRef.setInput('cta', cta);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
