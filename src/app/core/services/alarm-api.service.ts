import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppwriteService } from './appwrite.service';
import {
  GetAlarmFlowsResponse,
  GetDisciplinesResponse,
  AlarmFlowsQueryParams,
  AlarmFlowsByDisciplineDTO,
  DisciplineDTO,
} from './api-types';

/**
 * Alarm Management API Service
 * Handles all API calls to the alarm management backend via Appwrite functions
 */
@Injectable({ providedIn: 'root' })
export class AlarmApiService {
  private appwrite = inject(AppwriteService);

  // Appwrite function ID for alarm management API
  private readonly FUNCTION_ID = 'fn-alarm-management';

  /**
   * GET /disciplines - List all disciplines with types
   */
  getDisciplines(): Observable<DisciplineDTO[]> {
    return this.appwrite
      .executeApiFunction<GetDisciplinesResponse>(this.FUNCTION_ID, '/disciplines', 'GET')
      .pipe(map((response) => response.data?.disciplines || []));
  }

  /**
   * GET /alarm-flows - Get alarm flows by discipline
   * @param params - Query parameters (optional disciplineId)
   */
  getAlarmFlows(params?: AlarmFlowsQueryParams): Observable<AlarmFlowsByDisciplineDTO[]> {
    console.log('AlarmApiService.getAlarmFlows called with params:', params);
    console.log('Function ID:', this.FUNCTION_ID);

    return this.appwrite
      .executeApiFunction<GetAlarmFlowsResponse>(this.FUNCTION_ID, '/alarm-flows', 'GET', params)
      .pipe(
        map((response) => {
          console.log('API Response:', response);
          return response.data || [];
        })
      );
  }

  // Add more API methods as needed following the same pattern
}
