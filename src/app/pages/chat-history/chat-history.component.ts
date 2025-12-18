import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatApiService } from '../../core/services/chat-api.service';
import { Chat } from '../../core/services/chat-api-types';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.css',
})
export class ChatHistoryComponent implements OnInit {
  private chatApi = inject(ChatApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  chats: Chat[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    console.log('ChatHistoryComponent: Loading chats');
    this.isLoading = true;
    this.chatApi.listChats(50).subscribe({
      next: (response) => {
        console.log('ChatHistoryComponent: Chats loaded', response);
        this.chats = response.chats || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ChatHistoryComponent: Error loading chats', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredChats(): Chat[] {
    if (!this.searchQuery.trim()) return this.chats;
    const query = this.searchQuery.toLowerCase();
    return this.chats.filter(chat =>
      (chat.title?.toLowerCase().includes(query)) ||
      (chat.csvFileName?.toLowerCase().includes(query))
    );
  }

  get last7Days(): Chat[] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.filteredChats.filter(chat => {
      const chatDate = new Date(chat.createdAt).getTime();
      return chatDate >= sevenDaysAgo;
    });
  }

  get last30Days(): Chat[] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.filteredChats.filter(chat => {
      const chatDate = new Date(chat.createdAt).getTime();
      return chatDate < sevenDaysAgo && chatDate >= thirtyDaysAgo;
    });
  }

  get olderChats(): Chat[] {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.filteredChats.filter(chat => {
      const chatDate = new Date(chat.createdAt).getTime();
      return chatDate < thirtyDaysAgo;
    });
  }

  openChat(chat: Chat): void {
    const chatId = chat.chatId || chat.id || '';
    console.log('ChatHistoryComponent: Opening chat', chatId);
    this.router.navigate(['/chat'], { queryParams: { id: chatId } });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  getChatDisplayName(chat: Chat): string {
    return chat .chatId || chat.title || 'Untitled Chat';
  }
}
