import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowChartComponent } from './flow-chart.component';

describe('FlowChart', () => {
  let component: FlowChartComponent;
  let fixture: ComponentFixture<FlowChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
