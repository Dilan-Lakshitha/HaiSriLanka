import { TestBed } from '@angular/core/testing';
import { SelectFieldComponent } from './select-field.component';

describe('SelectFieldComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [SelectFieldComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SelectFieldComponent);
    fixture.componentRef.setInput('label', 'Count');
    fixture.componentRef.setInput('forId', 'count');
    fixture.componentRef.setInput('options', [{ value: 1, label: '1' }]);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
