import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-agent-card',
  templateUrl: './agent-card.component.html',
  styleUrls: ['./agent-card.component.css'],
  standalone: true,
  imports: [],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AgentCardComponent {
  @Input() agent: any;
  @Output() viewDetails = new EventEmitter<any>();

  onViewDetails(): void {
    this.viewDetails.emit(this.agent);
  }
}
