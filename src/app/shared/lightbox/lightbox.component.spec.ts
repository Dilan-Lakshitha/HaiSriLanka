import { TestBed } from '@angular/core/testing';
import { LightboxComponent } from './lightbox.component';

describe('LightboxComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [LightboxComponent] }).compileComponents();
    const fixture = TestBed.createComponent(LightboxComponent);
    fixture.componentRef.setInput('images', [
      { src: '/assets/images/destinations/galle.webp', alt: 'Galle' },
    ]);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
