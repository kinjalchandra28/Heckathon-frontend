import { Component, EventEmitter, Input,Output } from '@angular/core';
import { ProgramModule } from '../models/program-module.model';
import { WorkflowNode } from '../models/workflow.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-config-panel',
  imports: [
    // CdkDrag, 
    FormsModule, CommonModule 
  ],
  templateUrl: './property-config-panel.html',
  styleUrl: './property-config-panel.scss',
})
export class PropertyConfigPanel {

  // @Input() node: FlowNode | null = null;
  @Input() node: WorkflowNode = { id: 'tpl-trigger', type: 'trigger', label: 'Alarm Trigger' , position: { x: 100, y: 100 } };
  @Input() module: ProgramModule | null = null;

  @Output() labelChange = new EventEmitter<{ nodeId: string; label: string }>();
  @Output() descriptionChange = new EventEmitter<{ nodeId: string; description: string }>();
  @Output() parameterChange = new EventEmitter<{ nodeId: string; key: string; value: any }>();
  @Output() positionChange = new EventEmitter<{ nodeId: string; position: { x: number; y: number } }>();
  @Output() deleteNode = new EventEmitter<string>();
  @Output() closePanel = new EventEmitter<void>();

  onLabelChange(label: string): void {
    if (this.node) {
      this.labelChange.emit({ nodeId: this.node.id, label });
    }
  }

  onDescriptionChange(description: string): void {
    if (this.node) {
      this.descriptionChange.emit({ nodeId: this.node.id, description });
    }
  }

  onParameterChange(key: string, value: any): void {
    if (this.node) {
      this.parameterChange.emit({ nodeId: this.node.id, key, value });
    }
  }

  onPositionChange(axis: 'x' | 'y', value: number): void {
    if (this.node) {
      const newPosition = {
        x: axis === 'x' ? value : this.node.position.x,
        y: axis === 'y' ? value : this.node.position.y
      };
      this.positionChange.emit({ nodeId: this.node.id, position: newPosition });
    }
  }
}
