import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { RoomModel } from '../../models/room.model';
import { SensorDataModel } from '../../models/sensor-data.model';
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
  temps: SensorDataModel[] = [];
  hums: SensorDataModel[] = [];
  lights: SensorDataModel[] = [];
  relays: SensorDataModel[] = [];
  rooms: RoomModel[] = [];
  lightRooms: RoomModel[] = [];
  tempRooms: RoomModel[] = [];
  sensorDataModel: SensorDataModel = new SensorDataModel();

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

      this.signalR.on('Hum', (res) => {
        const existingSensorIndex = this.hums.findIndex(hum => hum.id === res.data.id);        
        
        if (existingSensorIndex !== -1) {
          this.hums[existingSensorIndex].value = res.data.value;

        } 
  
        console.log(this.hums);
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

  getHums(hums: SensorDataModel[]) {
    hums = hums.filter(sensor => sensor.sensorType?.value === 4);
    this.hums = hums;
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
  
      this.getHums(allSensorDatas);
      this.getTemps(allSensorDatas);
      this.getLights(allSensorDatas);
      this.getRelays(allSensorDatas);

      this.lightRooms = this.rooms.filter(room =>
        room.devices?.some(device =>
          device.sensorDatas?.some(sensor =>
            sensor.sensorType?.value === 1 || sensor.sensorType?.value === 2
          )
        )
      );

      this.tempRooms = this.rooms.filter(room =>
        room.devices?.some(device =>
          device.sensorDatas?.some(sensor =>
            sensor.sensorType?.value === 3 || sensor.sensorType?.value === 4
          )
        )
      );
    });
  }

  onToggleSwitch(sensor: SensorDataModel, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    sensor.value = isChecked ? 1 : 0;
    this.updateSensorData(sensor);
  }

  updateSensorData(sensor: SensorDataModel) {
    this.http.post("SensorDatas/Update", sensor, (res) => {
    });
  }
}
