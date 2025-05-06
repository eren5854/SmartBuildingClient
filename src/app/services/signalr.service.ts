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
      .withUrl('https://localhost:7232/sensor-hub', {
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
