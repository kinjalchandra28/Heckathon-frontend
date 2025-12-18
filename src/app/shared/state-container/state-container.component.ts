import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-state-container',
  templateUrl: './state-container.component.html',
  styleUrls: ['./state-container.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StateContainerComponent {
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() loadingMessage: string = 'Loading...';
  @Input() errorTitle: string = 'Something went wrong';
  @Input() spinnerSize: 'small' | 'medium' | 'large' = 'medium';

  @Output() retry = new EventEmitter<void>();

  get spinnerSizeClass(): string {
    switch (this.spinnerSize) {
      case 'small':
        return 'h-8 w-8';
      case 'large':
        return 'h-16 w-16';
      default:
        return 'h-12 w-12';
    }
  }

  onRetry(): void {
    this.retry.emit();
  }
}
