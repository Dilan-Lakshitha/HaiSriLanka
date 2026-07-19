import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BlogPreviewComponent } from './blog-preview.component';

describe('BlogPreviewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(BlogPreviewComponent);
    fixture.componentRef.setInput('intro', { eyebrow: 'E', title: 'T', subtitle: 'S' });
    fixture.componentRef.setInput('posts', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
