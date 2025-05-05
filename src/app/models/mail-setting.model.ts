export class MailSettingModel{
    id?:string;
    email:string = "";
    appPassword:string = "";
    smtpDomainName:string = "";
    smtpPort:number = 0;
}