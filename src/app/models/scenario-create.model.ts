export class ScenarioCreateUpdateModel{
    id?:string;
    appUserId:string = "";
    scenarioName:string = "";
    scenarioDescription?:string;
    triggerSensorId?:string;
    triggerType:number=0;
    triggerValue?:number=0;
    triggerTime?:any;
    actionSensorId?:string;
    actionType?:number = 0;
    actionValue?:number = 0;
}