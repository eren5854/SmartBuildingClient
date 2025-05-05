import { RoomModel } from "./room.model";

export class SensorModel{
    id?:string;
    sensorName: string = "";
    description?: string;
    sensorType?: number;
    serialNo?: string;
    secretKey?: string;
    status?:string;
    appUserId: string = "";
    roomId?:string;
    createdDate:any;
    roomInfo?: RoomModel;
    data1: number = 0;
    data2?: number;
    data3?: number;
    data4?: number;
    data5?:string;
    data6?:string;
}