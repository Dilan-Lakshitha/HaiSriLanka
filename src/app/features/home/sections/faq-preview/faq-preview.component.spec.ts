import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FaqPreviewComponent } from './faq-preview.component';

describe('FaqPreviewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [FaqPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(FaqPreviewComponent);
    fixture.componentRef.setInput('intro', { eyebrow: 'E', title: 'T', subtitle: 'S' });
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
