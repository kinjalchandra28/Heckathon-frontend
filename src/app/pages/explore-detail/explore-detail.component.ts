import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Agent } from '../../core/models/agent.model';

@Component({
  selector: 'app-explore-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-detail.component.html',
  styleUrl: './explore-detail.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ExploreDetailComponent {
  @Input() agent: Agent | null = null;
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();

  constructor(private router: Router) {}

  thingsToTry = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis est enim, facilisis at ultricies quis, iaculis in lorem.',
    'Donec vel egestas nisl, vitae tempus libero. Ut elementum justo pretium pretium posuere.',
    'Aliquam nisl nibh, mattis eu ex in, eleifend lobortis lorem.',
    'Curabitur mollis elit nec mi ullamcorper, sit amet fermentum metus finibus.'
  ];

  features = [
    { text: 'A feature that makes this Agent cool!' },
    { text: 'A feature that makes this Agent cool!' },
    { text: 'A feature that makes this Agent cool!' }
  ];

  close(): void {
    this.closePanel.emit();
  }

  goToFlowChart(): void {
    if (this.agent) {
      this.close();
      this.router.navigate(['/flow-chart', this.agent.id]);
    }
  }
}
