import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DestinationsPreviewComponent } from './destinations-preview.component';

describe('DestinationsPreviewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationsPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DestinationsPreviewComponent);
    fixture.componentRef.setInput('intro', { eyebrow: 'E', title: 'T', subtitle: 'S' });
    fixture.componentRef.setInput('destinations', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
