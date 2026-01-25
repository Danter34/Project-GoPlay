import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportTypeManagementComponent } from './sport-type-management.component';

describe('SportTypeManagementComponent', () => {
  let component: SportTypeManagementComponent;
  let fixture: ComponentFixture<SportTypeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SportTypeManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
