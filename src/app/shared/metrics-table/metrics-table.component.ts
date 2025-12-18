import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsData } from './metrics.interface';

@Component({
  selector: 'app-metrics-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-table.component.html',
  styleUrls: ['./metrics-table.component.css']
})
export class MetricsTableComponent {
  @Input() data!: MetricsData;

  getStatusColor(status: string): string {
    switch (status) {
      case 'Critical':
        return 'text-orange-500';
      case 'Warning':
        return 'text-yellow-500';
      case 'Okay':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  getBorderColor(status: string): string {
    switch (status) {
      case 'Critical':
        return 'border-l-orange-400';
      case 'Warning':
        return 'border-l-yellow-400';
      case 'Okay':
        return 'border-l-gray-300';
      default:
        return 'border-l-gray-300';
    }
  }

  onSpeak(): void {
    if ('speechSynthesis' in window) {
      const text = this.data.metrics
        .map(m => `${m.name}: ${m.status}`)
        .join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  }

  onCopy(): void {
    const text = this.data.metrics
      .map(m => `${m.name}\t${m.metric.type}=${m.metric.value}\t${m.status}\t${m.history ?? '-'}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  }

  onRefresh(): void {
    // Placeholder for refresh action
  }

  onDislike(): void {
    // Placeholder for dislike feedback
  }
}
