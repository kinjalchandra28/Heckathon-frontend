import { Component, ViewChild, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { SummaryResponseComponent } from '../../shared/summary-response/summary-response.component';
import { SummaryData } from '../../shared/summary-response/summary.interface';
import { TemperatureChartComponent } from '../../shared/temperature-chart/temperature-chart.component';
import { GraphData } from '../../shared/temperature-chart/graph.interface';
import { MetricsTableComponent } from '../../shared/metrics-table/metrics-table.component';
import { MetricsData } from '../../shared/metrics-table/metrics.interface';

interface ChatMessage {
  text: string;
  sender: 'user' | 'agent';
  file?: { name: string; type: string };
  summaryData?: SummaryData;
  graphData?: GraphData;
  metricsData?: MetricsData;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SummaryResponseComponent, TemperatureChartComponent, MetricsTableComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  message = '';
  uploadedFile: { name: string; type: string } | null = null;
  activeFile: { name: string; type: string } | null = null; // Keep track of file for conversation
  showSuggestions = false;
  messages: ChatMessage[] = [];
  isLoading = false;

  suggestions = [
    'Summarise this file',
    'Find temperature anomalies',
    'Look for concerning alarm patterns'
  ];

  get canSend(): boolean {
    return !!(this.message.trim() || this.uploadedFile);
  }

  onInputFocus(): void {
    // Show suggestions if there's a file uploaded or an active file in conversation
    if (this.uploadedFile || this.activeFile) {
      this.showSuggestions = true;
    }
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
      const userMessage = this.message;
      const userFile = this.uploadedFile;

      // If a new file is uploaded, set it as the active file
      if (userFile) {
        this.activeFile = userFile;
      }

      this.messages.push({
        text: userMessage,
        sender: 'user',
        file: userFile || undefined
      });

      this.message = '';
      this.uploadedFile = null;
      this.fileInput.nativeElement.value = '';

      // Check request type and handle accordingly (use activeFile for context)
      const lowerMessage = userMessage.toLowerCase();
      const hasFile = userFile || this.activeFile;

      if (lowerMessage.includes('summarise') && hasFile) {
        this.handleSummariseRequest();
      } else if ((lowerMessage.includes('temperature') || lowerMessage.includes('anomal') || lowerMessage.includes('anomol')) && hasFile) {
        this.handleTemperatureAnomaliesRequest();
      } else if ((lowerMessage.includes('alarm') || lowerMessage.includes('pattern') || lowerMessage.includes('concerning')) && hasFile) {
        this.handleAlarmPatternsRequest();
      }
    }
  }

  private handleSummariseRequest(): void {
    this.isLoading = true;

    this.http.get<SummaryData>('assets/ui/summary.json')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.messages.push({
            text: '',
            sender: 'agent',
            summaryData: data
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading summary:', err);
          this.messages.push({
            text: 'Sorry, I could not process the file summary. Please try again.',
            sender: 'agent'
          });
        }
      });
  }

  private handleTemperatureAnomaliesRequest(): void {
    this.isLoading = true;

    this.http.get<GraphData>('assets/ui/graph.json')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.messages.push({
            text: '',
            sender: 'agent',
            graphData: data
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading graph data:', err);
          this.messages.push({
            text: 'Sorry, I could not analyze temperature anomalies. Please try again.',
            sender: 'agent'
          });
        }
      });
  }

  private handleAlarmPatternsRequest(): void {
    this.isLoading = true;

    this.http.get<MetricsData>('assets/ui/data.json')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.messages.push({
            text: '',
            sender: 'agent',
            metricsData: data
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading metrics data:', err);
          this.messages.push({
            text: 'Sorry, I could not analyze alarm patterns. Please try again.',
            sender: 'agent'
          });
        }
      });
  }
}
