import { ActionModel } from "./action.model";
import { ScenarioSensorModel } from "./scenario-sensor.model";

export class TriggerModel{
    id?:string;
    triggerSensorInfo?:ScenarioSensorModel;
    triggerType?:any;
    triggerValue?:number;
    triggerTime?:any;
    actionInfo?:ActionModel;
}