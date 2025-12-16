import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions, selectUser } from '../../store';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
}

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent {
  private store = inject(Store);

  user$ = this.store.select(selectUser);

  navItems: NavItem[] = [
    { label: 'New Chat', icon: 'assets/icons/chat.svg', route: '/chat' },
    { label: 'Explore', icon: 'assets/icons/explore.svg', route: '/explore' },
    { label: 'Search Chats', icon: 'assets/icons/search.svg', route: '/search-chats' },
    { label: 'To Action', icon: 'assets/icons/notification.svg' },
  ];

  agents = ['Refrigerant Data', 'Refrigerant Overhead', 'Refrigeration Call Outs'];
  chats = Array(7).fill('LT1_HG76983289');
  agentsExpanded = true;

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
