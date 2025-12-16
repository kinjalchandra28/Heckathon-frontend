import { AlarmPatternDTO } from '../services/api-types';

/**
 * Agent interface for UI representation
 * Used across explore and detail components
 */
export interface Agent {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  alarmPattern?: AlarmPatternDTO;
  disciplineTypeId?: string;
}
