import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSearchComponent } from './map-search.component';

describe('MapSearchComponent', () => {
  let component: MapSearchComponent;
  let fixture: ComponentFixture<MapSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
