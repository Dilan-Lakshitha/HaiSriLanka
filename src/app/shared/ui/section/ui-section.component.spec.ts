import { TestBed } from '@angular/core/testing';
import { UiSectionComponent } from './ui-section.component';

describe('UiSectionComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [UiSectionComponent] }).compileComponents();
    expect(TestBed.createComponent(UiSectionComponent).componentInstance).toBeTruthy();
  });
});
