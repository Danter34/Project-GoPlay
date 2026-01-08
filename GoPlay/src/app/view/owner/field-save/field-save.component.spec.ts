import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldSaveComponent } from './field-save.component';

describe('FieldSaveComponent', () => {
  let component: FieldSaveComponent;
  let fixture: ComponentFixture<FieldSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldSaveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
