import { Routes } from '@angular/router';
import { ExploreComponent } from './pages/explore/explore.component';
import { FlowChartComponent } from './pages/flow-chart/flow-chart.component';
import { ChatComponent } from './pages/chat/chat.component';

export const routes: Routes = [
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  { path: 'explore', component: ExploreComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'flow-chart/:id', component: FlowChartComponent }
];
