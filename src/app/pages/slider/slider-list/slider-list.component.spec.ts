import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderListComponent } from './slider-list.component';

describe('SliderListComponent', () => {
  let component: SliderListComponent;
  let fixture: ComponentFixture<SliderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
