import { Component, inject, OnInit } from '@angular/core';
import { DiagramViewerComponent } from '../diagram-viewer/diagram-viewer.component';
import { ProgramModule } from '../models/program-module.model';
import { epc_high_data } from '../epc_high.data';
import { refrigeration_data } from '../refrigeration.data';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentService } from '../agent.service';
import { PropertyConfigPanel } from '../property-config-panel/property-config-panel';
import { WorkflowNode } from '../models/workflow.model';

@Component({
  selector: 'app-flow-chart-editor-container',
  imports: [
    DiagramViewerComponent,
    PropertyConfigPanel
  ],
  templateUrl: './flow-chart-editor-container.html',
  styleUrl: './flow-chart-editor-container.css',
})
export class FlowChartEditorContainer implements OnInit {
  private route = inject(ActivatedRoute);
  private agentService = inject(AgentService);

  private node: WorkflowNode = { id: 'tpl-trigger', type: 'trigger', label: 'Alarm Trigger', position: { x: 100, y: 100 } };
  modules: ProgramModule[] = refrigeration_data;
  constructor() {
    console.log('FlowChartEditorContainer initialized');
  }
  selectedNode() {
    return this.node;
  }
  onNodeChange(updatedNode: WorkflowNode) {
    console.log('Node updated:', updatedNode);
    this.node = updatedNode;
  }
  ngOnInit(): void {

    // Receive
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const agent = this.agentService.getAgentById(id || '');
      console.log('Retrieved agent for id:', id, agent);
      this.modules = this.agentService.getProgramModulesByAgentId(id || '') || [];
      console.log('Loaded modules for agent id:', id, this.modules);
    });
  }


  onLabelChange(event: any) {
    console.log('Label changed:', event);
   }
  onDescriptionChange(event: any) {
    console.log('Description changed:', event);
   }
  onParameterChange(event: any) {
    console.log('Parameter changed:', event);
   }
  onPositionChange(event: any) {
    console.log('Position changed:', event);
   }
  onDeleteNode(event: any) {
    console.log('Node deleted:', event);
   }
  onClosePanel() { }
}
