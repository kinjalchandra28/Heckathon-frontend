import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { ExploreComponent } from './pages/explore/explore.component';
import { FlowChartComponent } from './pages/flow-chart/flow-chart.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatHistoryComponent } from './pages/chat-history/chat-history.component';
import { LoginComponent } from './pages/login/login.component';
import { FlowChartEditorContainer } from './pages/flow-chart-editor/flow-chart-editor-container/flow-chart-editor-container';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },

  // Protected routes
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  {
    path: 'explore',
    component: ExploreComponent,
    canActivate: [authGuard],
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard],
  },
  {
    path: 'search-chats',
    component: ChatHistoryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'flow-chart/:id',
    component: FlowChartEditorContainer,
    canActivate: [authGuard],
  },

  // Wildcard redirect
  { path: '**', redirectTo: 'flow-chart/id' },
  // { path: '**', redirectTo: 'explore' },
];
