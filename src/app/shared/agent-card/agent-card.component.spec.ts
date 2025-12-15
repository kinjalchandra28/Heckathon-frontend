
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentCardComponent } from './agent-card.component';

describe('AgentCard', () => {
  let component: AgentCardComponent;
  let fixture: ComponentFixture<AgentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
