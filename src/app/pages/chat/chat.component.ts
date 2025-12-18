import { Component, ViewChild, ElementRef, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, take, forkJoin, Subscription } from 'rxjs';
import { SummaryResponseComponent } from '../../shared/summary-response/summary-response.component';
import { SummaryData } from '../../shared/summary-response/summary.interface';
import { TemperatureChartComponent } from '../../shared/temperature-chart/temperature-chart.component';
import { GraphData } from '../../shared/temperature-chart/graph.interface';
import { MetricsTableComponent } from '../../shared/metrics-table/metrics-table.component';
import { MetricsData } from '../../shared/metrics-table/metrics.interface';
import { ChatApiService } from '../../core/services/chat-api.service';
import { ChatEventsService } from '../../core/services/chat-events.service';
import { AppwriteService } from '../../core/services/appwrite.service';
import { Message } from '../../core/services/chat-api-types';

interface ChatMessage {
  text: string;
  sender: 'user' | 'agent';
  file?: { name: string; type: string };
  summaryData?: SummaryData;
  graphData?: GraphData;
  metricsData?: MetricsData;
  graphUrl?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SummaryResponseComponent, TemperatureChartComponent, MetricsTableComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private cdr = inject(ChangeDetectorRef);
  private chatApi = inject(ChatApiService);
  private chatEvents = inject(ChatEventsService);
  private appwrite = inject(AppwriteService);
  private route = inject(ActivatedRoute);
  private messageSubscription?: Subscription;
  private pendingMessageId?: string;

  // Collection ID for messages (from chat-architecture.md)
  private readonly MESSAGES_COLLECTION_ID = 'messages';

  message = '';
  uploadedFile: { name: string; type: string } | null = null;
  uploadedFileRaw: File | null = null;
  activeFile: { name: string; type: string } | null = null;
  currentChatId: string | null = null;
  chatTitle: string | null = null;
  chatCreatedAt: string | null = null;
  showSuggestions = false;
  messages: ChatMessage[] = [];
  isLoading = false;
  chatLoading = false;

  suggestions = [
    'Can you summarize the temperature data from my refrigeration system?',
    'Find temperature anomalies',
    'Look for concerning alarm patterns'
  ];

  ngOnInit(): void {
    console.log('ChatComponent ngOnInit');
    // Check for chat ID in query params
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      const chatId = params['id'];
      if (chatId && chatId !== this.currentChatId) {
        console.log('Loading chat from query param:', chatId);
        this.loadChat(chatId);
      } else if (!chatId) {
        // New chat - clear the state
        console.log('New chat - clearing state');
        this.resetChat();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up Realtime subscriptions
    this.cleanupMessageSubscription();
  }

  resetChat(): void {
    this.cleanupMessageSubscription();
    this.messages = [];
    this.currentChatId = null;
    this.chatTitle = null;
    this.chatCreatedAt = null;
    this.uploadedFile = null;
    this.uploadedFileRaw = null;
    this.activeFile = null;
    this.message = '';
    this.isLoading = false;
    this.chatLoading = false;
    this.pendingMessageId = undefined;
    this.cdr.detectChanges();
  }

  private cleanupMessageSubscription(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
    if (this.pendingMessageId) {
      this.appwrite.unsubscribeFromDocument(this.MESSAGES_COLLECTION_ID, this.pendingMessageId);
      this.pendingMessageId = undefined;
    }
  }

  /**
   * Subscribe to Realtime updates for a message
   * When the assistant message is updated (content changes from "Processing..."), update the UI
   */
  private subscribeToMessageUpdates(messageId: string): void {
    console.log('=== SUBSCRIBING TO MESSAGE UPDATES ===');
    console.log('Message ID:', messageId);

    // Clean up any existing subscription
    this.cleanupMessageSubscription();

    this.pendingMessageId = messageId;
    this.messageSubscription = this.appwrite.subscribeToDocument<any>(
      this.MESSAGES_COLLECTION_ID,
      messageId
    ).subscribe({
      next: (updatedMessage) => {
        console.log('=== REALTIME MESSAGE UPDATE ===');
        console.log('Updated message:', updatedMessage);

        // Check if the message is no longer processing
        const isProcessing = updatedMessage.content === 'Processing your question...' ||
                            updatedMessage.content === 'Analyzing your refrigeration data...';

        if (!isProcessing) {
          console.log('Message processing complete, updating UI');

          // Find and update the assistant message in the messages array
          const messageIndex = this.messages.findIndex(
            msg => msg.sender === 'agent' && msg.text.includes('Processing')
          );

          if (messageIndex !== -1) {
            // Convert the updated message to ChatMessage format
            const updatedChatMessage = this.convertApiMessageToChatMessage(updatedMessage);
            this.messages[messageIndex] = updatedChatMessage;
          } else {
            // If not found, add as new message
            const updatedChatMessage = this.convertApiMessageToChatMessage(updatedMessage);
            this.messages.push(updatedChatMessage);
          }

          // Stop loading and clean up subscription
          this.isLoading = false;
          this.cleanupMessageSubscription();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('=== REALTIME SUBSCRIPTION ERROR ===');
        console.error('Error:', err);
        this.cleanupMessageSubscription();
      }
    });
  }

  /**
   * Convert API message to ChatMessage format for display
   */
  private convertApiMessageToChatMessage(apiMessage: any): ChatMessage {
    const chatMessage: ChatMessage = {
      text: apiMessage.content || '',
      sender: apiMessage.role === 'user' ? 'user' : 'agent'
    };

    // Handle summary data if present
    if (apiMessage.summaryData) {
      chatMessage.summaryData = this.mapApiSummaryToUi(apiMessage.summaryData, apiMessage.content || '');

      // Map datapoints to metrics data
      if (apiMessage.summaryData.datapoints && apiMessage.summaryData.datapoints.length > 0) {
        chatMessage.metricsData = {
          device: {
            id: 'device-001',
            name: 'Refrigeration Unit',
            store_number: 1234,
            store_name: 'Store',
            case_class: 'Standard',
            pack_class: 'Standard',
            pack_name: 'Pack-001'
          },
          metrics: apiMessage.summaryData.datapoints.map((dp: any, index: number) => ({
            id: `metric-${index}`,
            name: dp.label,
            metric: {
              type: dp.label,
              value: parseFloat(dp.value) || 0,
              unit: dp.unit
            },
            status: (dp.status === 'critical' ? 'Critical' : dp.status === 'warning' ? 'Warning' : 'Okay') as 'Critical' | 'Warning' | 'Okay',
            history: null,
            description: `${dp.label}: ${dp.value} ${dp.unit}`
          })),
          metadata: {
            generated_at: new Date().toISOString(),
            data_range: {
              from: new Date().toISOString(),
              to: new Date().toISOString()
            },
            total_datapoints: apiMessage.summaryData.datapoints.length
          }
        };
      }
    }

    // Handle graph URL if present
    if (apiMessage.graphUrl) {
      chatMessage.graphUrl = apiMessage.graphUrl;
    }

    return chatMessage;
  }

  loadChat(chatId: string): void {
    console.log('=== LOADING CHAT ===');
    console.log('Chat ID:', chatId);
    this.chatLoading = true;
    this.messages = [];
    this.currentChatId = chatId;

    // Call both getChat and listMessages APIs in parallel
    forkJoin({
      chatInfo: this.chatApi.getChat(chatId),
      messagesList: this.chatApi.listMessages(chatId)
    }).subscribe({
      next: (response) => {
        console.log('=== CHAT LOADED ===');
        console.log('Chat Info:', response.chatInfo);
        console.log('Messages List:', response.messagesList);
        this.currentChatId = chatId;

        // Set active file and chat info from chat data
        const chatData = response.chatInfo?.chat;
        if (chatData?.csvFileName) {
          const fileName = chatData.csvFileName;
          const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
          this.activeFile = { name: fileName.replace(/\.[^/.]+$/, ''), type: ext };
          // Use file name (without extension) as chat title
          this.chatTitle = fileName.replace(/\.[^/.]+$/, '');
          console.log('Active file set:', this.activeFile);
        } else if (chatData?.title) {
          this.chatTitle = chatData.title;
        }

        // Set chat created date
        if (chatData?.createdAt) {
          this.chatCreatedAt = chatData.createdAt;
        }

        // Get messages from listMessages API (primary source)
        const apiMessages = response.messagesList?.messages || response.chatInfo?.messages || [];
        console.log('API Messages to process:', apiMessages);

        // Convert API messages to chat messages
        if (apiMessages && apiMessages.length > 0) {
          console.log('Processing', apiMessages.length, 'messages');
          this.messages = apiMessages.map((msg: any, index: number) => {
            console.log(`Message ${index}:`, msg);
            const chatMessage: ChatMessage = {
              text: msg.content || '',
              sender: msg.role === 'user' ? 'user' : 'agent'
            };

            // Handle summary data if present
            if (msg.summaryData) {
              chatMessage.summaryData = this.mapApiSummaryToUi(msg.summaryData, msg.content || '');
            }

            // Handle graph URL if present
            if (msg.graphUrl) {
              chatMessage.graphUrl = msg.graphUrl;
            }

            return chatMessage;
          });
          console.log('Processed messages:', this.messages);
        } else {
          console.log('No messages found in response');
        }

        this.chatLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('=== ERROR LOADING CHAT ===');
        console.error('Error:', err);
        this.chatLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapApiSummaryToUi(apiSummary: any, content: string): SummaryData {
    return {
      device: {
        id: 'device-001',
        name: 'Refrigeration Unit',
        store_number: 1234,
        store_name: 'Store',
        case_class: 'Standard',
        pack_name: 'Pack-001'
      },
      analysis_date: new Date().toISOString(),
      recommendations: apiSummary.recommendations?.map((rec: any, index: number) => ({
        id: rec.id || `rec-${index}`,
        title: rec.title,
        confidence: rec.priority === 'high' ? 95 : rec.priority === 'medium' ? 75 : 50,
        severity: rec.priority as 'high' | 'medium' | 'low',
        description: rec.description,
        recommendations: [rec.actionLabel],
        affected_metrics: [],
        related_data: {}
      })) || [],
      summary: {
        title: 'Analysis Summary',
        description: typeof apiSummary.summary === 'string'
          ? apiSummary.summary
          : (apiSummary.summary as any)?.description || content || '',
        overall_health: (apiSummary.summary as any)?.overall_health || 'Good',
        priority_actions: (apiSummary.summary as any)?.priority_actions || apiSummary.recommendations?.map((r: any) => r.actionLabel) || []
      },
      metrics_summary: {
        critical_count: 0,
        warning_count: apiSummary.recommendations?.filter((r: any) => r.priority === 'high').length || 0,
        okay_count: apiSummary.recommendations?.filter((r: any) => r.priority !== 'high').length || 0,
        total_alerts: apiSummary.recommendations?.length || 0,
        data_quality_score: 95
      },
      metadata: {
        model_version: '1.0',
        analysis_type: 'AI Analysis',
        data_points_analyzed: 1000,
        time_range: {
          from: new Date().toISOString(),
          to: new Date().toISOString()
        }
      }
    };
  }

  get canSend(): boolean {
    return !!(this.message.trim() || this.uploadedFile);
  }

  get formattedChatDate(): string {
    if (!this.chatCreatedAt) return '';
    const date = new Date(this.chatCreatedAt);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    const day = date.getDate();
    const suffix = this.getDaySuffix(day);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${hour12}:${minutes}${ampm} on ${day}${suffix} ${month} ${year}`;
  }

  private getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
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
      this.uploadedFileRaw = file;
    }
  }

  removeFile(): void {
    this.uploadedFile = null;
    this.uploadedFileRaw = null;
    this.fileInput.nativeElement.value = '';
  }

  selectSuggestion(text: string): void {
    this.message = text;
    this.showSuggestions = false;
  }

  sendMessage(): void {
    // Prevent multiple sends while loading
    if (!this.canSend || this.isLoading) {
      return;
    }

    const userMessage = this.message;
    const userFile = this.uploadedFile;
    const userFileRaw = this.uploadedFileRaw;

    // If a new file is uploaded, set it as the active file
    if (userFile) {
      this.activeFile = userFile;
    }

    // Add user message to chat
    this.messages.push({
      text: userMessage,
      sender: 'user',
      file: userFile || undefined
    });

    // Clear input fields
    this.message = '';
    this.uploadedFile = null;
    this.uploadedFileRaw = null;
    this.fileInput.nativeElement.value = '';

    // Show loading and call API
    this.isLoading = true;
    this.cdr.detectChanges();
    this.callChatApi(userMessage, userFileRaw || undefined);
  }

  private apiCallInProgress = false;

  private callChatApi(content: string, file?: File): void {
    // Prevent duplicate API calls
    if (this.apiCallInProgress) {
      console.log('API call already in progress, skipping...');
      return;
    }

    this.apiCallInProgress = true;
    const wasNewChat = !this.currentChatId;
    console.log('=== CALLING CHAT API ===');
    console.log('Content:', content);
    console.log('File:', file?.name);
    console.log('Current Chat ID:', this.currentChatId);
    console.log('Is new chat:', wasNewChat);

    this.chatApi.sendMessageWithFile(this.currentChatId, content, file)
      .pipe(
        take(1),
        finalize(() => {
          // Only stop loading if not waiting for Realtime updates
          if (!this.pendingMessageId) {
            this.isLoading = false;
          }
          this.apiCallInProgress = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('=== CHAT API RESPONSE ===');
          console.log('Chat ID:', response.chatId);
          console.log('Status:', response.status);
          console.log('User Message:', response.userMessage);
          console.log('Assistant Message:', response.assistantMessage);
          console.log('Processing Time:', response.processingTime, 'ms');
          console.log('Full API Response:', JSON.stringify(response, null, 2));

          // Store the chat ID for subsequent messages
          this.currentChatId = response.chatId;

          // Notify sidebar if a new chat was created
          if (wasNewChat && response.chatId) {
            console.log('New chat created, notifying sidebar');
            this.chatEvents.notifyChatCreated(response.chatId);
          }

          // Check if the response is still processing (async architecture)
          if (response.status === 'processing') {
            console.log('Response is processing, subscribing to Realtime updates');

            // Add placeholder message to UI
            this.handleAssistantResponse(response.assistantMessage);

            // Subscribe to Realtime updates for the assistant message
            const messageId = response.assistantMessage?.id || response.assistantMessage?.$id;
            if (messageId) {
              this.subscribeToMessageUpdates(messageId);
            } else {
              console.warn('No message ID found for Realtime subscription');
              this.isLoading = false;
            }
          } else {
            // Response is complete, process it directly
            this.isLoading = false;
            this.handleAssistantResponse(response.assistantMessage);
          }
        },
        error: (err) => {
          console.error('=== CHAT API ERROR ===');
          console.error('Error:', err);

          this.messages.push({
            text: err.message || 'Sorry, something went wrong. Please try again.',
            sender: 'agent'
          });
          this.cdr.detectChanges();
        }
      });
  }

  private handleAssistantResponse(assistantMessage: Message): void {
    const chatMessage: ChatMessage = {
      text: assistantMessage.content || '',
      sender: 'agent'
    };

    // Check if the response has summary data
    if (assistantMessage.summaryData) {
      const apiSummary = assistantMessage.summaryData;

      // Map API summary data to UI format
      chatMessage.summaryData = {
        device: {
          id: 'device-001',
          name: 'Refrigeration Unit',
          store_number: 1234,
          store_name: 'Store',
          case_class: 'Standard',
          pack_name: 'Pack-001'
        },
        analysis_date: new Date().toISOString(),
        recommendations: apiSummary.recommendations?.map((rec, index) => ({
          id: rec.id || `rec-${index}`,
          title: rec.title,
          confidence: rec.priority === 'high' ? 95 : rec.priority === 'medium' ? 75 : 50,
          severity: rec.priority as 'high' | 'medium' | 'low',
          description: rec.description,
          recommendations: [rec.actionLabel],
          affected_metrics: [],
          related_data: {}
        })) || [],
        summary: {
          title: 'Analysis Summary',
          description: typeof apiSummary.summary === 'string'
            ? apiSummary.summary
            : (apiSummary.summary as any)?.description || assistantMessage.content || '',
          overall_health: (apiSummary.summary as any)?.overall_health || 'Good',
          priority_actions: (apiSummary.summary as any)?.priority_actions || apiSummary.recommendations?.map(r => r.actionLabel) || []
        },
        metrics_summary: {
          critical_count: 0,
          warning_count: apiSummary.recommendations?.filter(r => r.priority === 'high').length || 0,
          okay_count: apiSummary.recommendations?.filter(r => r.priority !== 'high').length || 0,
          total_alerts: apiSummary.recommendations?.length || 0,
          data_quality_score: 95
        },
        metadata: {
          model_version: '1.0',
          analysis_type: 'AI Analysis',
          data_points_analyzed: 1000,
          time_range: {
            from: new Date().toISOString(),
            to: new Date().toISOString()
          }
        }
      };

      // Map datapoints to metrics data
      if (apiSummary.datapoints && apiSummary.datapoints.length > 0) {
        chatMessage.metricsData = {
          device: {
            id: 'device-001',
            name: 'Refrigeration Unit',
            store_number: 1234,
            store_name: 'Store',
            case_class: 'Standard',
            pack_class: 'Standard',
            pack_name: 'Pack-001'
          },
          metrics: apiSummary.datapoints.map((dp, index) => ({
            id: `metric-${index}`,
            name: dp.label,
            metric: {
              type: dp.label,
              value: parseFloat(dp.value) || 0,
              unit: dp.unit
            },
            status: (dp.status === 'critical' ? 'Critical' : dp.status === 'warning' ? 'Warning' : 'Okay') as 'Critical' | 'Warning' | 'Okay',
            history: null,
            description: `${dp.label}: ${dp.value} ${dp.unit}`
          })),
          metadata: {
            generated_at: new Date().toISOString(),
            data_range: {
              from: new Date().toISOString(),
              to: new Date().toISOString()
            },
            total_datapoints: apiSummary.datapoints.length
          }
        };
      }
    }

    // Store graph URL if available
    if (assistantMessage.graphUrl) {
      chatMessage.graphUrl = assistantMessage.graphUrl;
    }

    this.messages.push(chatMessage);
    this.cdr.detectChanges();
  }
}
