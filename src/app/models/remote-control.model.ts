import { RemoteControlKeyModel } from "./remote-control-key.model";

export class RemoteControlModel{
    id?:string;
    name:string = "";
    description?:string;
    serialNo:string = "";
    remoteControlKeys:RemoteControlKeyModel[] = [];
}