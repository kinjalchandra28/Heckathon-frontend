import { Component, inject, OnInit, signal } from '@angular/core';
import { DiagramViewerComponent } from '../diagram-viewer/diagram-viewer.component';
import { ProgramModule } from '../../../core/services/api-types';
import { epc_high_data } from '../epc_high.data';
import { refrigeration_data } from '../refrigeration.data';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentService } from '../agent.service';
import { PropertyConfigPanel } from '../property-config-panel/property-config-panel';
import { WorkflowNode } from '../models/workflow.model';
import { Agent } from '../../../core/models/agent.model';

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
  isConfigPanelOpen = signal(true);

  private node: WorkflowNode = { id: 'tpl-trigger', type: 'trigger', label: 'Alarm Trigger', position: { x: 100, y: 100 } };
  agent = signal<Agent | null>(null);
  modules: ProgramModule[] = refrigeration_data;
  selectedModule = signal<ProgramModule | null>(null);

  constructor() {
    console.log('FlowChartEditorContainer initialized');
  }
  // selectedNode() {
  //   // this.isConfigPanelOpen.set(!!this.node);
  //   return this.node;
  // }
  onNodeChange(updatedNode: WorkflowNode) {
    console.log('Node updated:', updatedNode);
    this.node = updatedNode;
  }
  ngOnInit(): void {

    // Receive
    this.route.paramMap.subscribe(params => {
      // const id = params.get('id');
      const id = '69408eee0038af5492e7';
      const agent = this.agentService.getAgentById(id || '');
      if (agent) { this.agent.set(agent); }
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
  onDeleteNode(event: string) {
    this.modules = this.modules.filter(module => module.name !== event);
    console.log('Node deleted:', event);
  }
  onClosePanel() {
    this.isConfigPanelOpen.set(false);
  }

  onSelectedModule(module: ProgramModule) {
    console.log('Selected module:', module);
    this.isConfigPanelOpen.set(true);
    const m = this.modules.find(m => m.name === module.name);
    if (m) {
      this.selectedModule.set(m);
    } else {
      this.selectedModule.set(null);
    }
    console.log('Selected module boolen:', this.selectedModule(), this.isConfigPanelOpen());
  }

  onDeletedModule(name: string) {
    console.log('Deleted module:', name);
    // this.isConfigPanelOpen.set(false);
    this.modules = this.modules.filter(module => module.name !== name);
    this.onClosePanel();
    this.selectedModule.set(null);
  }
}


