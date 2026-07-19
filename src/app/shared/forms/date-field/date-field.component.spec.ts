import { TestBed } from '@angular/core/testing';
import { DateFieldComponent } from './date-field.component';

describe('DateFieldComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [DateFieldComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DateFieldComponent);
    fixture.componentRef.setInput('label', 'Date');
    fixture.componentRef.setInput('forId', 'date');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
