import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAddComponent } from './page-add.component';

describe('PageAddComponent', () => {
  let component: PageAddComponent;
  let fixture: ComponentFixture<PageAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
