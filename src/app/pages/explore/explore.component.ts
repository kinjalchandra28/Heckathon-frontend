import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { AgentCardComponent } from '../../shared/agent-card/agent-card.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ExploreDetailComponent } from '../explore-detail/explore-detail.component';

interface Agent {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  standalone: true,
  imports: [CommonModule, MatChipsModule, AgentCardComponent, MatButtonModule, ExploreDetailComponent]
})
export class ExploreComponent {
  categories = ['All', 'Refrigeration', 'HVAC', 'Solar', 'Lighting'];
  selectedCategory = 'All';
  selectedAgent: Agent | null = null;
  isDetailOpen = false;

  featured: Agent[] = [
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

  get filteredAgents(): Agent[] {
    if (this.selectedCategory === 'All') {
      return this.featured;
    }
    return this.featured.filter(agent => agent.category === this.selectedCategory);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
  }

  openDetail(agent: Agent): void {
    this.selectedAgent = agent;
    this.isDetailOpen = true;
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedAgent = null;
  }
}
