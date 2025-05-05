import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { AuthService } from '../../services/auth.service';
import { SensorModel } from '../../models/sensor.model';
import { Router, RouterLink } from '@angular/router';
import { RoomModel } from '../../models/room.model';
import { DeviceModel, DeviceType } from '../../models/device.model';

@Component({
  selector: 'app-sensors',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './sensors.component.html',
  styleUrl: './sensors.component.css'
})
export class SensorsComponent {
  devices: DeviceModel[] = [];
  deviceModel: DeviceModel = new DeviceModel();
  selectedRoomId: string | null = null;
  rooms: RoomModel[] = [];

  deviceTypes: DeviceType[] = [
    { name: "Other", value: 0 },
    { name: "Esp32", value: 1 },
    { name: "Esp01", value: 2 },
    { name: "Nodemcu", value: 3 },
    { name: "RaspberryPi", value: 4 },
    { name: "Arduino", value: 5 }
  ];
  
  constructor(
    private http: HttpService,
    private swal: SwalService,
    public auth: AuthService,
    private router: Router
  ) {
    this.get();
    this.getRoom();
  }

  get() {
    this.http.get(`Devices/GetAllByAppUserId?AppUserId=${this.auth.user.id}`, (res) => {
      this.devices = res.data;
      console.log(res.data);

    })
  }

  create(form: NgForm) {
    if (form.valid) {
      // this.deviceModel.deviceType = this.sensorTip; // sensorTip bir obje oldu
      this.http.post("Devices/Create", this.deviceModel, (res) => {
        console.log(res.data);
        this.get();
      });
    }
  }

  getRoom() {
    this.http.get(`Rooms/GetAllByAppUserId?appUserId=${this.auth.user.id}`, (res) => {
      this.rooms = res.data;
      console.log(this.rooms);
    });
  }

  setRoomId(id: string) {
    this.selectedRoomId = id;
    this.deviceModel.roomId = id;
  }
}