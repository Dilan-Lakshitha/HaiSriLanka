import { TestBed } from '@angular/core/testing';
import { UiBadgeComponent } from './ui-badge.component';

describe('UiBadgeComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [UiBadgeComponent] }).compileComponents();
    expect(TestBed.createComponent(UiBadgeComponent).componentInstance).toBeTruthy();
  });
});
