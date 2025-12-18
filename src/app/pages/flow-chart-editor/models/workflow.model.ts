export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'notification';
  label: string;
  position: { x: number; y: number };
  config?: Record<string, any>;
}