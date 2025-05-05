import { TriggerModel } from "./trigger.model";

export class ScenarioModel{
    id?:string;
    scenarioName:string = "";
    scenarioDescription?:string;
    triggerInfo?:TriggerModel;
    isActive?:boolean;
}