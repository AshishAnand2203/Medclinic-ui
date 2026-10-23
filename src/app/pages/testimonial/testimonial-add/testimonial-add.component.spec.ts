import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialAddComponent } from './testimonial-add.component';

describe('TestimonialAddComponent', () => {
  let component: TestimonialAddComponent;
  let fixture: ComponentFixture<TestimonialAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestimonialAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
