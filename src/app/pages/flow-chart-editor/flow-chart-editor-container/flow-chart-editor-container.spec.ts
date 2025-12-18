import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowChartEditorContainer } from './flow-chart-editor-container';

describe('FlowChartEditorContainer', () => {
  let component: FlowChartEditorContainer;
  let fixture: ComponentFixture<FlowChartEditorContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowChartEditorContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowChartEditorContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
