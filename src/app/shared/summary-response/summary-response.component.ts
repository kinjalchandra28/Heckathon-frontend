import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryData } from './summary.interface';

@Component({
  selector: 'app-summary-response',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-response.component.html',
  styleUrls: ['./summary-response.component.css']
})
export class SummaryResponseComponent {
  @Input() data!: SummaryData;

  getConfidenceClass(confidence: number): string {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  onSpeak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  }

  onCopy(text: string): void {
    navigator.clipboard.writeText(text);
  }

  onRefresh(): void {
    // Placeholder for refresh action
  }

  onDislike(): void {
    // Placeholder for dislike feedback
  }
}
