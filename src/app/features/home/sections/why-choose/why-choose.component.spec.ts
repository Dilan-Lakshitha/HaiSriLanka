import { TestBed } from '@angular/core/testing';
import { WhyChooseComponent } from './why-choose.component';

describe('WhyChooseComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [WhyChooseComponent] }).compileComponents();
    const fixture = TestBed.createComponent(WhyChooseComponent);
    fixture.componentRef.setInput('intro', {
      eyebrow: 'Why',
      title: 'Title',
      subtitle: 'Sub',
    });
    fixture.componentRef.setInput('items', [
      { id: '1', title: 'A', description: 'B', icon: 'private' },
    ]);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
