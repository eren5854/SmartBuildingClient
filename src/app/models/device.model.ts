import { SensorDataModel } from "./sensor-data.model";

export class DeviceModel{
    id?:string;
    deviceName:string = "";
    deviceDescription?:string;
    serialNo:string = "";
    status?:boolean;
    secretKey?:string;
    deviceType?:DeviceType;
    type?:number;
    roomId:string = "";
    sensorDatas?:SensorDataModel[] = [];
    createdAt?:any;
}

export class DeviceType{
    name:string = "";
    value:number = 0;
}