import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  navItems: NavItem[] = [
    { label: 'New Chat', icon: 'assets/icons/chat.svg', route: '/chat' },
    { label: 'Explore', icon: 'assets/icons/explore.svg', route: '/explore' },
    { label: 'Search Chats', icon: 'assets/icons/search.svg' },
    { label: 'To Action', icon: 'assets/icons/notification.svg' }
  ];

  agents = ['Refrigerant Data', 'Refrigerant Overhead', 'Refrigeration Call Outs'];
  chats = Array(7).fill('LT1_HG76983289');
  agentsExpanded = true;
}
