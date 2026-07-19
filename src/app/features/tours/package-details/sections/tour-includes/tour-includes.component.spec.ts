import { TestBed } from '@angular/core/testing';
import { TourIncludesComponent } from './tour-includes.component';

describe('TourIncludesComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourIncludesComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourIncludesComponent);
    fixture.componentRef.setInput('includes', []);
    fixture.componentRef.setInput('excludes', []);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
