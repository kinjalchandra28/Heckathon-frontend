import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flow-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flow-chart.component.html',
  styleUrls: ['./flow-chart.component.css'],
})
export class FlowChartComponent {
  flowId!: string;
  flowData: any;

  // Nodes and edges for the SVG
  nodes: Array<{ id: string; x: number; y: number; label: string }> = [];
  edges: Array<{ from: string; to: string }> = [];

  CONTROL_HIGH_JSON = {
    // your full JSON pasted here
    program_modules: [
      // copy the "program_modules" array you shared
    ]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.flowId = this.route.snapshot.paramMap.get('id')!;
    this.loadFlowJson(this.flowId);
  }

  loadFlowJson(id: string): void {
    if (id === 'CONTROL_HIGH') {
      this.flowData = this.CONTROL_HIGH_JSON;
      this.generateFlowChart(this.flowData.program_modules);
    }
  }

  generateFlowChart(modules: any[]): void {
    // Create nodes
    this.nodes = modules.map((m) => ({
      id: m.name,
      x: m.x * 100, // scale for SVG canvas
      y: m.y * 0.8, // scale for SVG canvas
      label: this.resolveLabel(m),
    }));

    // Create edges
    this.edges = [];
    modules.forEach((m) => {
      if (m.inputs) {
        m.inputs.forEach((inputName: string) => {
          // only connect if input exists in modules
          if (modules.find((mod) => mod.name === inputName)) {
            this.edges.push({ from: inputName, to: m.name });
          }
        });
      }
    });
  }

  getNode(id: string) {
    return this.nodes.find((n) => n.id === id);
  }

  resolveLabel(m: any): string {
    switch (m.type) {
      case 6: return '%';
      case 11: return '+';
      case 12: return '-';
      case 1: return '>';
      case 18: return 'SEV';
      case 0: return m.inputs?.[0] ?? '';
      default: return '';
    }
  }
}
