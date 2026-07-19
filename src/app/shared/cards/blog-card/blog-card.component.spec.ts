import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BlogCardComponent } from './blog-card.component';
import type { BlogPost } from '../../../core/models';

const post = {
  id: '1',
  slug: 'best-time',
  title: 'Best time',
  excerpt: 'Excerpt',
  content: 'Content',
  author: 'Editor',
  publishDate: '2026-01-01',
  images: [{ src: '/assets/images/placeholders/blog-season.svg', alt: 'Season' }],
  tags: [],
  seo: { metaTitle: 't', metaDescription: 'd', keywords: [] },
  status: 'published',
} as BlogPost;

describe('BlogCardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(BlogCardComponent);
    fixture.componentRef.setInput('post', post);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
