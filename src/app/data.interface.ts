// src/app/data.interface.ts

export interface AlarmPatterns {
  [key: string]: string; // Allows keys like 'trap_pdu_1' with string values
}

export interface DisciplineType {
  id: number;
  name: string;
  description: string;
  alarm_patterns: AlarmPatterns;
}

export interface Discipline {
  id: number;
  name: string;
  discipline_types: DisciplineType[];
}

export interface ProjectData {
  project_name: string;
  version: string;
  disciplines: Discipline[];
}