import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatItem {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.css',
})
export class ChatHistoryComponent {
  searchQuery = '';

  chats: ChatItem[] = [
    { name: 'Temperature Analysis Report', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { name: 'HVAC System Check', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: 'Refrigerant Levels Query', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { name: 'Energy Consumption Stats', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { name: 'Cooling Efficiency Report', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { name: 'Maintenance Schedule', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { name: 'Alarm Patterns Analysis', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) }
  ];

  get filteredChats(): ChatItem[] {
    if (!this.searchQuery.trim()) return this.chats;
    const query = this.searchQuery.toLowerCase();
    return this.chats.filter(chat => chat.name.toLowerCase().includes(query));
  }

  get last7Days(): ChatItem[] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.filteredChats.filter(chat => chat.date.getTime() >= sevenDaysAgo);
  }

  get last30Days(): ChatItem[] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.filteredChats.filter(chat => chat.date.getTime() < sevenDaysAgo && chat.date.getTime() >= thirtyDaysAgo);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
}
