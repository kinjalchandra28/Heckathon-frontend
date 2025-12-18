
import { Component, ChangeDetectionStrategy, input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { DiagramNodeComponent } from '../diagram-node/diagram-node.component';
import { Connection, ProgramModule } from '../models/program-module.model';
import { WorkflowEditorNodeComponent } from '../workflow-editor-node/workflow-editor-node.component';
import { WorkflowNode } from '../models/workflow.model';



@Component({
  selector: 'app-diagram-viewer',
  standalone: true,
  imports: [CommonModule, WorkflowEditorNodeComponent],
  templateUrl: './diagram-viewer.component.html',
  styleUrl:
    './diagram-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramViewerComponent {
  modules = input.required<ProgramModule[]>();
  
  // Local state for modules to allow for mutation (dragging)
  localModules = signal<ProgramModule[]>([]);

  draggedModuleInfo = signal<{
    module: ProgramModule;
    startX: number;
    startY: number;
    startMouseX: number;
    startMouseY: number;
  } | null>(null);

  private readonly MODULE_WIDTH = 200;
  private readonly MODULE_HEIGHT = 110;

  constructor() {
    effect(() => {
      // When input modules change, reset local state with a deep copy
      this.localModules.set(JSON.parse(JSON.stringify(this.modules())));
    });
  }

  private moduleMap = computed(() => {
    const map = new Map<string, ProgramModule>();
    for (const module of this.localModules()) {
      map.set(module.name, module);
    }
    return map;
  });

  connections = computed(() => {
    const connectionsArray: Connection[] = [];
    const allModules = this.localModules();
    const map = this.moduleMap();

    for (const targetModule of allModules) {
      if (!targetModule.inputs) continue;

      for (const inputName of targetModule.inputs) {
        const sourceModule = map.get(inputName);

        if (sourceModule) {
          const startX = sourceModule.x + this.MODULE_WIDTH;
          const startY = sourceModule.y + this.MODULE_HEIGHT / 2;
          const endX = targetModule.x;
          const endY = targetModule.y + this.MODULE_HEIGHT / 2;

          const hOffset = Math.abs(endX - startX) * 0.6;
          const controlPointX1 = startX + hOffset;
          const controlPointY1 = startY;
          const controlPointX2 = endX - hOffset;
          const controlPointY2 = endY;

          const pathData = `M ${startX} ${startY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endX} ${endY}`;

          connectionsArray.push({
            path: pathData,
            id: `${sourceModule.name}-${targetModule.name}`,
          });
        }
      }
    }
    return connectionsArray;
  });

  onDragStart(event: MouseEvent, module: ProgramModule) {
    event.preventDefault();
    this.draggedModuleInfo.set({
      module,
      startX: module.x,
      startY: module.y,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
    });
  }

  onDrag(event: MouseEvent) {
    const info = this.draggedModuleInfo();
    if (!info) return;

    event.preventDefault();
    const deltaX = event.clientX - info.startMouseX;
    const deltaY = event.clientY - info.startMouseY;

    this.localModules.update(modules =>
      modules.map(m =>
        m.name === info.module.name
          ? { ...m, x: info.startX + deltaX, y: info.startY + deltaY }
          : m
      )
    );
  }

  onDragEnd() {
    this.draggedModuleInfo.set(null);
  }


   programModuleExample: ProgramModule = {
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
  
     workflowNodeExample: WorkflowNode = { id: 'tpl-trigger', type: 'trigger', label: 'Alarm Trigger' , position: { x: 100, y: 100 } };
  
}