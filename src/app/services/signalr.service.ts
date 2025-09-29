import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hub: signalR.HubConnection | undefined;

  constructor() {}

  startConnection(callback: () => void) {
    this.hub = new signalR.HubConnectionBuilder()
      // .withUrl('https://apismartbuilding.erendelibas.xyz/sensor-hub', {
      // .withUrl('https://192.168.68.134:45455/sensor-hub', {
      .withUrl('http://188.132.232.172:54080/sensor-hub', {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hub
      .start()
      .then(() => {
        console.log('SignalR bağlantısı başlatıldı.');
        callback();
      })
      .catch((err: any) => console.error('SignalR bağlantısı başlatılamadı:', err));
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.hub?.on(event, callback);
  }

}
