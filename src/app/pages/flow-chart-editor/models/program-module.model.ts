// Interfaces for type safety
export interface ProgramModule {
  type: number;
  x: number;
  y: number;
  name: string;
  inputs: string[];
  parameters: string[];
  classes?: string[]; 
}

export interface Connection {
  path: string;
  id: string;
}