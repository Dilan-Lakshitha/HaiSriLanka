import { TestBed } from '@angular/core/testing';
import { UiHeadingComponent } from './ui-heading.component';

describe('UiHeadingComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [UiHeadingComponent] }).compileComponents();
    expect(TestBed.createComponent(UiHeadingComponent).componentInstance).toBeTruthy();
  });
});
