import { TestBed } from '@angular/core/testing';
import { MapEmbedComponent } from './map-embed.component';

describe('MapEmbedComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [MapEmbedComponent] }).compileComponents();
    const fixture = TestBed.createComponent(MapEmbedComponent);
    fixture.componentRef.setInput('geo', { lat: 6.9, lng: 79.8 });
    expect(fixture.componentInstance).toBeTruthy();
  });
});
