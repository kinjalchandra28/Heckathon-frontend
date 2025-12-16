import { Component, OnInit, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { AgentCardComponent } from '../../shared/agent-card/agent-card.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ExploreDetailComponent } from '../explore-detail/explore-detail.component';
import { AlarmApiService } from '../../core/services/alarm-api.service';
import { AlarmFlowsByDisciplineDTO } from '../../core/services/api-types';
import { Agent } from '../../core/models/agent.model';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    AgentCardComponent,
    MatButtonModule,
    ExploreDetailComponent,
  ],
})
export class ExploreComponent implements OnInit {
  private alarmApi = inject(AlarmApiService);

  categories: string[] = ['All'];
  selectedCategory = 'All';
  selectedAgent: Agent | null = null;
  isDetailOpen = false;

  featured: Agent[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('ExploreComponent ngOnInit called');
    this.loadAlarmFlows();
  }

  loadAlarmFlows(): void {
    console.log('Loading alarm flows...');
    this.loading = true;
    this.error = null;

    this.alarmApi.getAlarmFlows().subscribe({
      next: (alarmFlows) => {
        console.log('Alarm flows received:', alarmFlows);
        this.processAlarmFlows(alarmFlows);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading alarm flows:', err);
        this.error = err.message || 'Failed to load alarm flows';
        this.loading = false;
      },
    });
  }

  private processAlarmFlows(alarmFlows: AlarmFlowsByDisciplineDTO[]): void {
    const agents: Agent[] = [];
    const categorySet = new Set<string>(['All']);

    alarmFlows.forEach((flow) => {
      const disciplineName = flow.discipline.name;

      flow.disciplineTypes.forEach((dt) => {
        categorySet.add(disciplineName);

        dt.alarms.forEach((alarm) => {
          agents.push({
            id: alarm.id,
            title: alarm.alarmId,
            category: disciplineName,
            description: alarm.textExpr || 'No description available',
            image: this.getCategoryIcon(disciplineName),
            alarmPattern: alarm,
            disciplineTypeId: dt.disciplineType.id,
          });
        });
      });
    });

    this.categories = Array.from(categorySet);
    this.featured = agents;
  }

  private getCategoryIcon(category: string): string {
    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('refrigeration') || categoryLower.includes('refrigerant')) {
      return 'assets/icons/refrigeration.svg';
    }
    if (categoryLower.includes('hvac')) {
      return 'assets/icons/hvac.svg';
    }
    if (categoryLower.includes('solar')) {
      return 'assets/icons/solar.svg';
    }
    if (categoryLower.includes('lighting') || categoryLower.includes('light')) {
      return 'assets/icons/lighting.svg';
    }

    // Default icon
    return 'assets/icons/explore.svg';
  }

  get filteredAgents(): Agent[] {
    if (this.selectedCategory === 'All') {
      return this.featured;
    }
    return this.featured.filter((agent) => agent.category === this.selectedCategory);
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

  onRefresh(): void {
    this.loadAlarmFlows();
  }
}
