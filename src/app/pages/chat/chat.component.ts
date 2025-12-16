import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  sender: 'user' | 'agent';
  file?: { name: string; type: string };
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  message = '';
  uploadedFile: { name: string; type: string } | null = null;
  showSuggestions = false;
  messages: ChatMessage[] = [];

  suggestions = [
    'Summarise this file',
    'Find temperature anomolies',
    'Look for concerning alarm patterns'
  ];

  get canSend(): boolean {
    return !!(this.message.trim() || this.uploadedFile);
  }

  onInputFocus(): void {
    this.showSuggestions = true;
  }

  onInputBlur(): void {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      this.uploadedFile = { name: file.name.replace(/\.[^/.]+$/, ''), type: ext };
    }
  }

  removeFile(): void {
    this.uploadedFile = null;
    this.fileInput.nativeElement.value = '';
  }

  selectSuggestion(text: string): void {
    this.message = text;
    this.showSuggestions = false;
  }

  sendMessage(): void {
    if (this.canSend) {
      this.messages.push({
        text: this.message,
        sender: 'user',
        file: this.uploadedFile || undefined
      });
      this.message = '';
      this.uploadedFile = null;
      this.fileInput.nativeElement.value = '';
    }
  }
}
