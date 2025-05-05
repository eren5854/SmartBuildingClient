import { SensorDataHistoryModel } from "./sensor-data-history.model";

export class SensorDataModel{
    id:string = "";
    dataName:string = "";
    pinNumber:number = 0;
    value?:number;
    value2?:string;
    sensorType?:SensorType;
    deviceId:string = "";
    sensorDataHistories?:SensorDataHistoryModel[] = [];
}

export class SensorType{
    name:string = "";
    value:number = 0;
}