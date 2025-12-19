import { Injectable } from "@angular/core";
import { Agent } from "../../core/models/agent.model";


@Injectable({
    providedIn: 'root',
})
export class AgentService {
    private agents: {[key:string]:Agent} = {[AGENT.id]: AGENT}

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


const AGENT: Agent = {
  "id": "69408eee0038af5492e7",
  "title": "OVEN_LEFT_ON_HRS",
  "category": "oven",
  "description": "\"Oven left on for too long",
  "image": "assets/icons/explore.svg",
  "alarmPattern": {
    "id": "69408eee0038af5492e7",
    "disciplineTypeId": "69408eee001ede260705",
    "alarmPatternKey": "69408eee001ede260705_OVEN_LEFT_ON_HRS",
    "version": 1,
    "isLatest": true,
    "no": 1,
    "alarmId": "OVEN_LEFT_ON_HRS",
    "textExpr": "\"Oven left on for too long\"",
    "genericFamily": "OVEN",
    "genericId": "ON_HRS",
    "trapPdu1": "DEVICE",
    "trapFlag": 1,
    "suppressionPeriod": 0,

    "programModules": [{
      "type": 11,
      "x": 311.953125,
      "y": 393.265625, "name": "$030d5c6d", "inputs": ["$6fc29b0c", "$7a097be8"]
    }, { "type": 0, "x": 3.292969, "y": 408.484375, "name": "$7a097be8", "inputs": ["=2C"], "parameters": [""] }, { "type": 11, "x": 492.160156, "y": 574.84375, "name": "$424a104d", "inputs": ["$38100e7f", "$6fc29b0c"] }, { "type": 0, "x": 4.082031, "y": 458.9375, "name": "$6fc29b0c", "inputs": ["oven_temperature"], "parameters": [""] }, { "type": 0, "x": 121.3125, "y": 623.148438, "name": "$38100e7f", "inputs": ["=0C"], "parameters": [""] }, { "type": 0, "x": 758.230469, "y": 548.730469, "name": "current_oven_temperature", "inputs": ["$424a104d"], "parameters": [""] }, { "type": 11, "x": 471.140625, "y": 227.421875, "name": "$4023fcf7", "inputs": ["$564a1b1c", "$3472fd03"] }, { "type": 0, "x": 769.476562, "y": 332.988281, "name": "test_pressure", "inputs": ["$4023fcf7"], "parameters": [""] }, { "type": 0, "x": 72.273438, "y": 220.867188, "name": "$3472fd03", "inputs": ["=1bar"], "parameters": [""] }, { "type": 3, "x": 477.457031, "y": 393.910156, "name": "$7ac0d924", "inputs": ["$030d5c6d"], "parameters": [""] }, { "type": 0, "x": 663.003906, "y": 432.835938, "name": "oven_average_2_temperature", "inputs": ["$7ac0d924"], "parameters": [""] }, { "type": 0, "x": 67.261719, "y": 318.191406, "name": "$564a1b1c", "inputs": ["=2.5bar"], "parameters": [""] }, { "type": 12, "x": 684.835938, "y": 96.800781, "name": "$113f318a", "inputs": ["$4023fcf7", "$1f4ee81c"] }, { "type": 0, "x": 814.152344, "y": 122.320312, "name": "test_2_pressure", "inputs": ["$113f318a"], "parameters": [""] }, { "type": 0, "x": 262.242188, "y": 93.761719, "name": "$1f4ee81c", "inputs": ["=0.2bar"], "parameters": [""] }],
    "createdAt": "2025-12-15T22:42:54.906+00:00", "createdBy": "import-service", "changeDescription": "Initial version"
  }, "disciplineTypeId": "69408eee001ede260705"
}