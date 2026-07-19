import { TestBed } from '@angular/core/testing';
import { UiContainerComponent } from './ui-container.component';

describe('UiContainerComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [UiContainerComponent] }).compileComponents();
    expect(TestBed.createComponent(UiContainerComponent).componentInstance).toBeTruthy();
  });
});
