import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { SensorModel } from '../../models/sensor.model';
import { RoomModel } from '../../models/room.model';
import { SensorDataModel } from '../../models/sensor-data.model';
import * as signalR from '@microsoft/signalr';
import { SignalrService } from '../../services/signalr.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  sensors: SensorModel[] = [];
  temps: SensorDataModel[] = [];
  lights: SensorDataModel[] = [];
  relays: SensorDataModel[] = [];
  rooms: RoomModel[] = [];
  sensorDataModel: SensorDataModel = new SensorDataModel();

  hub: signalR.HubConnection | undefined;
  constructor(
    private http: HttpService,
    public auth: AuthService,
    private signalR: SignalrService,
    private cdr: ChangeDetectorRef
  ) {
    this.getRoom();
    this.getSignalR();
  }

  getSignalR(){
    this.signalR.startConnection(() => {

      this.signalR.on('Relays', (res) => {
        this.rooms.forEach(room => {
          const sensorIndex = room.getAllSensor?.findIndex(sensor => sensor.id === res.data.id);
          if (sensorIndex !== -1) {
            room.getAllSensor![sensorIndex!].data1 = res.data.value;
          }
        });
      
        this.cdr.detectChanges();
      });

      this.signalR.on('Temp', (res) => {
        const existingSensorIndex = this.temps.findIndex(temp => temp.id === res.data.id);        
        
        if (existingSensorIndex !== -1) {
          this.temps[existingSensorIndex].value = res.data.value;

        } 
  
        console.log(this.temps);
      });

      this.signalR.on('Lights', (res) => {
        const existingSensorIndex = this.lights.findIndex(light => light.id === res.data.id);        
        
        if (existingSensorIndex !== -1) {
          this.lights[existingSensorIndex].value = res.data.value;

        }
  
        console.log(this.lights);
      });
    });
  }

  getTemps(temps: SensorDataModel[]) {
    temps = temps.filter(sensor => sensor.sensorType?.value === 3);
    this.temps = temps;
  }

  getLights(lights: SensorDataModel[]) {
    lights = lights.filter(sensor => sensor.sensorType?.value === 1);
    this.lights = lights;
  }

  getRelays(relays: SensorDataModel[]){
    relays = relays.filter(sensor => sensor.sensorType?.value === 2);
    this.relays = relays;
    console.log(relays);
  }

  getRoom() {
    this.http.get(`Rooms/GetAllByAppUserId?appUserId=${this.auth.user.id}`, (res) => {
      this.rooms = res.data;
      console.log(this.rooms);

      const allSensorDatas: SensorDataModel[] = this.rooms
        .flatMap(room => room.devices || [])
        .flatMap(device => device.sensorDatas || []);
  
      this.getTemps(allSensorDatas);
      this.getLights(allSensorDatas);
      this.getRelays(allSensorDatas);
    });
  }

  onToggleSwitch(sensor: SensorDataModel, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    sensor.value = isChecked ? 1 : 0;
    this.updateSensorData(sensor);
  }

  updateSensorData(sensor: SensorDataModel) {
    this.http.post("SensorDatas/Update", sensor, (res) => {
      console.log('Sensör durumu güncellendi:', res.data);
    });
  }
}
