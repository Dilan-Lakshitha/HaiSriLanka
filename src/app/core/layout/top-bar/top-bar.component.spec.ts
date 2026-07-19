import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
    expect(TestBed.createComponent(TopBarComponent).componentInstance).toBeTruthy();
  });
});
