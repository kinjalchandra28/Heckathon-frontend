import { Component, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';


@Component({
  selector: 'app-agent-card',
  templateUrl: './agent-card.component.html',
  styleUrls: ['./agent-card.component.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
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

    constructor(private router: Router) {}


  viewDetails(id: number): void {
    console.log('id==',id)
    this.router.navigate(['/flow-chart', id]);
  }
}
