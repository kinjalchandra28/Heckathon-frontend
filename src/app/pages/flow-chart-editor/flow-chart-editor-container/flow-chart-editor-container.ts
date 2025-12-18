import { Component } from '@angular/core';
import { DiagramViewerComponent } from '../diagram-viewer/diagram-viewer.component';
import { ProgramModule } from '../models/program-module.model';
import { epc_high_data } from '../epc_high.data';
import { refrigeration_data } from '../refrigeration.data';

@Component({
  selector: 'app-flow-chart-editor-container',
  imports: [
    DiagramViewerComponent
  ],
  templateUrl: './flow-chart-editor-container.html',
  styleUrl: './flow-chart-editor-container.css',
})
export class FlowChartEditorContainer {
  modules: ProgramModule[] = refrigeration_data;
  // modules: ProgramModule[] = epc_high_data;
}
