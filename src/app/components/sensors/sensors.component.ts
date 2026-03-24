import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef eklendi
import { FormsModule, NgForm } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { AuthService } from '../../services/auth.service';
import { SensorModel } from '../../models/sensor.model';
import { Router, RouterLink } from '@angular/router';
import { RoomModel } from '../../models/room.model';
import { DeviceModel, DeviceType } from '../../models/device.model';
import { SignalrService } from '../../services/signalr.service'; // SignalrService eklendi

@Component({
    selector: 'app-sensors',
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
    private router: Router,
    private signalR: SignalrService, // SignalR eklendi
    private cdr: ChangeDetectorRef   // CDR eklendi
  ) {
    this.get();
    this.getRoom();
    this.getSignalR(); // Anlık veriler için eklendi
  }

  // YENİ: SignalR dinleme fonksiyonu eklendi
  getSignalR() {
    this.signalR.startConnection(() => {
      
      const updateSensorData = (res: any) => {
        // devices dizisi içinde gezerek gelen id'ye ait sensörü bul ve güncelle
        this.devices.forEach(device => {
          const sensorIndex = device.sensorDatas?.findIndex(sensor => sensor.id === res.data.id);
          if (sensorIndex !== undefined && sensorIndex !== -1) {
            device.sensorDatas![sensorIndex].value = res.data.value;
            // Eğer Relays için data1 kullanılıyorsa, onu da güncelle
            if(res.data.sensorType?.name === 'Relay') {
              device.sensorDatas![sensorIndex].value = res.data.value; 
            }
          }
        });
        this.cdr.detectChanges(); // UI'ı yenile
      };

      this.signalR.on('Relays', updateSensorData);
      this.signalR.on('Hum', updateSensorData);
      this.signalR.on('Temp', updateSensorData);
      this.signalR.on('Lights', updateSensorData);
      this.signalR.on('Motion', updateSensorData);
      this.signalR.on('LDR', updateSensorData);
    });
  }

  get() {
    this.http.get(`Devices/GetAllByAppUserId?AppUserId=${this.auth.user.id}`, (res) => {
      this.devices = res.data;
      console.log(res.data);
    })
  }

  create(form: NgForm) {
    if (form.valid) {
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