import { Component, computed, inject, input, output, ViewContainerRef, signal, effect  } from '@angular/core';
// import { WorkflowNode } from '../workflow-editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragEnd, CdkDropList, CdkDragHandle } from '@angular/cdk/drag-drop';
import { IconsService } from './icons.services';

import {ProgramModule} from '../models/program-module.model';
import { WorkflowNode } from '../models/workflow.model';
const programModuleExample: ProgramModule = {
        "type": 0,
        "x": 73.015625,
        "y": 420.4375,
        "name": "$500d7a5a",
        "inputs": [
            "calculated_product_temperature"
        ],
        "parameters": [
            ""
        ]
    };

  const workflowNodeExample: WorkflowNode = { id: 'tpl-trigger', type: 'trigger', label: 'Alarm Trigger' , position: { x: 100, y: 100 } };

@Component({
  selector: 'app-workflow-editor-node',
  standalone: true,
  imports: [
    // CdkDrag, 
    FormsModule, CommonModule
  ],
  templateUrl: './workflow-editor-node.component.html',
  styleUrl: './workflow-editor-node.component.scss',
  host: {

    '[style.left.px]': 'module().x',
    '[style.top.px]': 'module().y',
    'style': 'width: 200px; height: 110px;',
    '(mousedown)': 'onMouseDown($event)'

  }
})
export class WorkflowEditorNodeComponent {

  module = input.required<ProgramModule>();
  isDragged = input(false);
  dragStart = output<{ event: MouseEvent; module: ProgramModule }>();

  hostClasses = computed(() => {
    const baseClasses = 'absolute flex flex-col p-3 rounded-lg shadow-lg text-white border-2 transition-transform duration-200 cursor-grab';
    const colorClass = this.getNodeColor(this.module().type);
    const draggedClass = this.isDragged() ? 'z-10 scale-105 shadow-sky-500/50' : '';
    return `${baseClasses} ${colorClass} ${draggedClass}`;
  });

  removeNode(id: string) {
    // Implementation for removing a node
  }
  onMouseDown(event: MouseEvent) {
    this.dragStart.emit({ event, module: this.module() });
  }

  getNodeColor(type: number): string {
    switch (type) {
      case 0:
        return 'bg-slate-800 border-sky-500';
      case 1:
        return 'bg-slate-800 border-teal-500';
      default:
        return 'bg-slate-800 border-gray-500';
    }
  }

  // node = input.required<WorkflowNode>();
  selectedNode = input(false);
  iconService = inject(IconsService);

  dragPositon = {x: 100, y: 100};

  constructor(private viewContainerRef: ViewContainerRef) {}

  // startConnection(event: MouseEvent, node: WorkflowNode, portType: 'input' | 'output'): void {
  //   // Logic to start a connection from this port
  // }

  getIcon(nodeType: string | number) {
    const key = nodeType.toString();
    return this.iconService.getIcon(key);
  }

}
