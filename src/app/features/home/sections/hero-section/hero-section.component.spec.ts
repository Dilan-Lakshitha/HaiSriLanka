import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroSectionComponent } from './hero-section.component';
import type { HomeHero } from '../../../../core/models';

const hero: HomeHero = {
  eyebrow: 'Private',
  title: 'Discover Ceylon',
  subtitle: 'Luxury journeys',
  primaryCta: { label: 'Tours', path: 'sri-lanka-tours' },
  secondaryCta: { label: 'Contact', path: 'contact' },
  image: {
    src: '/assets/images/placeholders/hero-ceylon.svg',
    alt: 'Hero',
    width: 1920,
    height: 1080,
  },
};

describe('HeroSectionComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeroSectionComponent);
    fixture.componentRef.setInput('hero', hero);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
