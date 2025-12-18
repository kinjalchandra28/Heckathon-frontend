import { Component, inject, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AuthActions, selectUser } from '../../store';
import { ChatApiService } from '../../core/services/chat-api.service';
import { ChatEventsService } from '../../core/services/chat-events.service';
import { Chat } from '../../core/services/chat-api-types';

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
export class SidePanelComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private chatApi = inject(ChatApiService);
  private chatEvents = inject(ChatEventsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private chatCreatedSub?: Subscription;

  @Output() chatSelected = new EventEmitter<string>();

  user$ = this.store.select(selectUser);

  navItems: NavItem[] = [
    { label: 'New Chat', icon: 'assets/icons/chat.svg', route: '/chat' },
    { label: 'Explore', icon: 'assets/icons/explore.svg', route: '/explore' },
    { label: 'Search Chats', icon: 'assets/icons/search.svg', route: '/search-chats' },
    { label: 'To Action', icon: 'assets/icons/notification.svg' },
  ];

  agents = ['Refrigerant Data', 'Refrigerant Overhead', 'Refrigeration Call Outs'];
  chats: Chat[] = [];
  chatsLoading = false;
  agentsExpanded = true;

  ngOnInit(): void {
    console.log('SidePanelComponent ngOnInit - loading chats');
    this.loadChats();

    // Subscribe to chat created events to refresh the list
    this.chatCreatedSub = this.chatEvents.onChatCreated$.subscribe((chatId) => {
      console.log('New chat created event received:', chatId);
      this.loadChats();
    });
  }

  ngOnDestroy(): void {
    this.chatCreatedSub?.unsubscribe();
  }

  loadChats(): void {
    console.log('loadChats() called');
    this.chatsLoading = true;
    this.chatApi.listChats(10).subscribe({
      next: (response) => {
        console.log('=== CHATS LOADED ===');
        console.log('Total chats:', response.total);
        console.log('Chats array:', response.chats);
        response.chats?.forEach((chat, index) => {
          console.log(`Chat ${index}:`, {
            id: chat.chatId,
            title: chat.title,
            status: chat.status,
            csvFileName: chat.csvFileName,
            messageCount: chat.messageCount,
            createdAt: chat.createdAt
          });
        });
        this.chats = response.chats || [];
        this.chatsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading chats:', err);
        this.chatsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openChat(chat: Chat): void {
    const chatId = chat.chatId || '';
    console.log('Opening chat:', chatId, chat);
    this.chatSelected.emit(chatId);
    this.router.navigate(['/chat'], { queryParams: { id: chatId } });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
