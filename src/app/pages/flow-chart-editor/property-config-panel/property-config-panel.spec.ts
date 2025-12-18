import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyConfigPanel } from './property-config-panel';

describe('PropertyConfigPanel', () => {
  let component: PropertyConfigPanel;
  let fixture: ComponentFixture<PropertyConfigPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyConfigPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyConfigPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
