import { TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [FormFieldComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('forId', 'name');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
