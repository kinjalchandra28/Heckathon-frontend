import { Component, Input, Output, EventEmitter, inject, OnInit, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Agent } from '../../core/models/agent.model';
import { AgentService } from '../flow-chart-editor/agent.service';
import { single } from 'rxjs';

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
export class ExploreDetailComponent implements OnInit {
  // @Input() agent: Agent | null = null;
  agent = input.required<Agent>();
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();
  private agentService = inject(AgentService);
  hasNotProgrammeModules = signal(true);

  constructor(private router: Router) {
    effect(() => {
      console.log('agent changed:', this.agent());
      this.agentService.setAgent(this.agent());
      if (this.agent() && this.agent().alarmPattern) {
        const alarmPattern = this.agent().alarmPattern;
        console.log('alarmPattern:', alarmPattern);
        alarmPattern?.programModules && alarmPattern.programModules.length > 0 ? this.hasNotProgrammeModules.set(false) : this.hasNotProgrammeModules.set(true);
        console.log('hasNotProgrammeModules', this.hasNotProgrammeModules());
      }
    });
  }
  ngOnInit(): void {
    
    // if (this.agent()) {
      
    //   console.log('agent', this.agent());
    //   this.agent().alarmPattern && this.agent().alarmPattern?.programModules && this.agent().alarmPattern?.programModules?.length > 0 ? this.hasNotProgrammeModules.set(false) : this.hasNotProgrammeModules.set(false);
    //   console.log('hasNotProgrammeModules', this.hasNotProgrammeModules());
    // }
  }

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
      // this.agentService.setAgent(this.agent());
      this.close();
      this.router.navigate(['/flow-chart', this.agent().id]);
    }
  }
}
