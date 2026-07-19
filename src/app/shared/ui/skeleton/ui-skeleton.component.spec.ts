import { TestBed } from '@angular/core/testing';
import { UiSkeletonComponent } from './ui-skeleton.component';

describe('UiSkeletonComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [UiSkeletonComponent] }).compileComponents();
    expect(TestBed.createComponent(UiSkeletonComponent).componentInstance).toBeTruthy();
  });
});
