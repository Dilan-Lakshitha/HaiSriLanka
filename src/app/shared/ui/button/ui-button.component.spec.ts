import { TestBed } from '@angular/core/testing';
import { UiButtonComponent } from './ui-button.component';

describe('UiButtonComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [UiButtonComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(UiButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
