import { TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

describe('BreadcrumbComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [BreadcrumbService],
    }).compileComponents();
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
