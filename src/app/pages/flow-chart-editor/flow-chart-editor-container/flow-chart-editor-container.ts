import { Component, inject, OnInit } from '@angular/core';
import { DiagramViewerComponent } from '../diagram-viewer/diagram-viewer.component';
import { ProgramModule } from '../models/program-module.model';
import { epc_high_data } from '../epc_high.data';
import { refrigeration_data } from '../refrigeration.data';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentService } from '../agent.service';

@Component({
  selector: 'app-flow-chart-editor-container',
  imports: [
    DiagramViewerComponent
  ],
  templateUrl: './flow-chart-editor-container.html',
  styleUrl: './flow-chart-editor-container.css',
})
export class FlowChartEditorContainer implements OnInit {
  private route = inject(ActivatedRoute);
  private agentService = inject(AgentService);

  modules: ProgramModule[] = refrigeration_data;
  constructor() { 
    console.log('FlowChartEditorContainer initialized');
  }
  ngOnInit(): void {

    // Receive
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.modules = this.agentService.getProgramModulesByAgentId(id || '') || [];
      console.log('Loaded modules for agent id:', id, this.modules);
    });
  }
}
