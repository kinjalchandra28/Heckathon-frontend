import { Routes } from '@angular/router';
import { ExploreComponent } from './pages/explore/explore.component';
import { FlowChartComponent } from './pages/flow-chart/flow-chart.component';

export const routes: Routes = [
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  { path: 'explore', component: ExploreComponent },
  { path: 'flow-chart/:id', component: FlowChartComponent }
];
