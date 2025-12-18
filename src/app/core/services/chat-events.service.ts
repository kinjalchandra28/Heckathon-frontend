import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service for chat-related events communication between components
 */
@Injectable({ providedIn: 'root' })
export class ChatEventsService {
  // Subject to notify when a new chat is created
  private chatCreated$ = new Subject<string>();

  // Observable for components to subscribe to
  onChatCreated$ = this.chatCreated$.asObservable();

  /**
   * Emit event when a new chat is created
   * @param chatId - The ID of the newly created chat
   */
  notifyChatCreated(chatId: string): void {
    console.log('ChatEventsService: notifying chat created:', chatId);
    this.chatCreated$.next(chatId);
  }
}
