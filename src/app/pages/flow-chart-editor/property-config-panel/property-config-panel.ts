import { Component, EventEmitter, input, Input, Output, inject, effect, output } from '@angular/core';

import { WorkflowNode } from '../models/workflow.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { Agent } from '../../../core/models/agent.model';
import { ProgramModule } from '../../../core/services/api-types';

@Component({
  selector: 'app-property-config-panel',
  imports: [
    // CdkDrag, 
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './property-config-panel.html',
  styleUrl: './property-config-panel.scss',
})
export class PropertyConfigPanel {
  private fb = inject(FormBuilder);

  configForm = this.fb.group({
    alarmId: [''],
    name: [''],
    description: [''],
    inputs: this.fb.array(['']),
    classes: this.fb.array(['']),
    parameters: this.fb.array(['']),
    type: [0],
    x: [0],
    y: [0]
  })
  // @Input() node: FlowNode | null = null;
  @Input() node: WorkflowNode = { id: 'tpl-trigger', type: 'trigger', label: 'Alarm Trigger', position: { x: 100, y: 100 } };
  module = input<ProgramModule | null>(null);
  agent = input<Agent | null>(null);
  updatedModule = output<ProgramModule>();
  // @Output() labelChange = new EventEmitter<{ nodeId: string; label: string }>();
  // @Output() descriptionChange = new EventEmitter<{ nodeId: string; description: string }>();
  // @Output() parameterChange = new EventEmitter<{ nodeId: string; key: string; value: any }>();
  // @Output() positionChange = new EventEmitter<{ nodeId: string; position: { x: number; y: number } }>();
  // @Output() deleteNode = new EventEmitter<string>();
  @Output() closePanel = new EventEmitter<void>();

  constructor() {
    console.log('PropertyConfigPanel initialized');
    this.configForm.get('name')?.disable();
    effect(() => {
      this.configForm.patchValue({
        alarmId: this.agent()?.id || '',
        name: this.module()?.name || '',
        description: this.agent()?.description || '',
        type: this.module()?.type || 0,
        x: this.module()?.x || 0,
        y: this.module()?.y || 0
      });
      this.module()?.inputs ? this.connectionInputs.clear() : this.connectionInputs.clear();

      this.connectionClasses.clear();
      this.connectionParameters.clear();
      this.module()?.inputs?.forEach(input => {
        this.connectionInputs.push(this.fb.control(input));
      });
    });
  }


  get connectionInputs() {
    return this.configForm.get('inputs') as FormArray;
  }
  addConnectionInput() {
    this.connectionInputs.push(this.fb.control(''));
  }
  removeConnectionInput(index: number) {
    this.connectionInputs.removeAt(index);
  }
  get connectionClasses() {
    return this.configForm.get('classes') as FormArray;
  }
  addConnectionClass() {
    this.connectionClasses.push(this.fb.control(''));
  }
  removeConnectionClass(index: number) {
    this.connectionClasses.removeAt(index);
  }
  get connectionParameters() {
    return this.configForm.get('parameters') as FormArray;
  }
  addConnectionParameter() {
    this.connectionParameters.push(this.fb.control(''));
  }
  removeConnectionParameter(index: number) {
    this.connectionParameters.removeAt(index);
  }

  updateModule() {
    console.log('updateModule called', this.configForm.value);

    const module: ProgramModule = {
      ...this.module()
    } as ProgramModule;
    if (this.configForm.value.x) {
      module.x = this.configForm.value.x;
    }
    if (this.configForm.value.y) {
      module.y = this.configForm.value.y;
    }
    if (this.configForm.value.inputs) {
      module.inputs = [...this.configForm.value.inputs] as string[]
    }

    this.updatedModule.emit(module);
  

  }
}