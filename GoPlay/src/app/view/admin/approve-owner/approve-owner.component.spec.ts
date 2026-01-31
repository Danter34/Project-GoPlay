import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveOwnerComponent } from './approve-owner.component';

describe('ApproveOwnerComponent', () => {
  let component: ApproveOwnerComponent;
  let fixture: ComponentFixture<ApproveOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
