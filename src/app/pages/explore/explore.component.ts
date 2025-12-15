import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { AgentCardComponent } from '../../shared/agent-card/agent-card.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  standalone: true,
  imports: [CommonModule, MatChipsModule, AgentCardComponent, MatButtonModule]
})
export class ExploreComponent {

  categories = ['All', 'Refrigeration', 'HVAC', 'Solar', 'Lighting'];

  featured = [
    {
      id: 1,
      title: 'Name of Agent',
      category: 'Refrigeration',
      description: 'Description of what this model offers and why you should use it.',
      image: 'assets/icons/refrigeration.svg'
    },
    {
      id: 2,
      title: 'Name of Agent',
      category: 'HVAC',
      description: 'Description of what this model offers and why you should use it.',
      image: 'assets/icons/hvac.svg'
    },
    {
      id: 3,
      title: 'Name of Agent',
      category: 'Lighting',
      description: 'Description of what this model offers and why you should use it.',
      image: 'assets/icons/lighting.svg'
    },
    {
      id: 4,
      title: 'Name of Agent',
      category: 'Solar',
      description: 'Description of what this model offers and why you should use it.',
      image: 'assets/icons/solar.svg'
    }
  ];
}