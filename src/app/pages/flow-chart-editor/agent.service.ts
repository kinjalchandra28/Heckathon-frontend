import { Injectable } from "@angular/core";
import { Agent } from "../../core/models/agent.model";


@Injectable({
    providedIn: 'root',
})
export class AgentService {
    private agents: {[key:string]:Agent} = {};

    setAgent(agent: Agent): void {
        this.agents[agent.id] = agent;
    }

    getAgents(): Agent[] {
        return Object.values(this.agents);
    }
    getAgentById(id: string): Agent | undefined {
        return this.agents[id];
    }
    getProgramModulesByAgentId(id: string): any[] | undefined {
        const agent = this.getAgentById(id);
        return agent ? agent.alarmPattern?.programModules : undefined;
    }

}