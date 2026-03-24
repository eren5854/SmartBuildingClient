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
    imports: [FormsModule, CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
  temps: SensorDataModel[] = [];
  hums: SensorDataModel[] = [];
  lights: SensorDataModel[] = [];
  relays: SensorDataModel[] = [];
  motions: SensorDataModel[] = []; // YENİ: Hareket Sensörleri
  ldrs: SensorDataModel[] = [];    // YENİ: LDR Sensörleri

  rooms: RoomModel[] = [];
  lightRooms: RoomModel[] = [];
  tempRooms: RoomModel[] = [];
  motionRooms: RoomModel[] = []; // YENİ: Hareket Sensörü olan Odalar
  ldrRooms: RoomModel[] = [];    // YENİ: LDR Sensörü olan Odalar
  
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

 getSignalR() {
    this.signalR.startConnection(() => {

      // Röle Dinlemesi
      this.signalR.on('Relays', (res) => {
        console.log('🔌 SignalR [Relays] Gelen Veri:', res); // Konsola yazdırıyoruz
        this.rooms.forEach(room => {
          const sensorIndex = room.getAllSensor?.findIndex(sensor => sensor.id === res.data.id);
          if (sensorIndex !== -1) {
            room.getAllSensor![sensorIndex!].data1 = res.data.value;
          }
        });
        this.cdr.detectChanges();
      });

      // Nem Dinlemesi
      this.signalR.on('Hum', (res) => {
        console.log('💧 SignalR [Hum] Gelen Veri:', res); // Konsola yazdırıyoruz
        const existingSensorIndex = this.hums.findIndex(hum => hum.id === res.data.id);        
        if (existingSensorIndex !== -1) {
          this.hums[existingSensorIndex].value = res.data.value;
        } 
        this.cdr.detectChanges(); // Arayüzün güncellenmesini garanti altına alıyoruz
      });

      // Sıcaklık Dinlemesi
      this.signalR.on('Temp', (res) => {
        console.log('🌡️ SignalR [Temp] Gelen Veri:', res); // Konsola yazdırıyoruz
        const existingSensorIndex = this.temps.findIndex(temp => temp.id === res.data.id);        
        if (existingSensorIndex !== -1) {
          this.temps[existingSensorIndex].value = res.data.value;
        } 
        this.cdr.detectChanges();
      });

      // Işıklar Dinlemesi
      this.signalR.on('Lights', (res) => {
        console.log('💡 SignalR [Lights] Gelen Veri:', res); // Konsola yazdırıyoruz
        const existingSensorIndex = this.lights.findIndex(light => light.id === res.data.id);        
        if (existingSensorIndex !== -1) {
          this.lights[existingSensorIndex].value = res.data.value;
        }
        this.cdr.detectChanges();
      });

      // Hareket (Motion) Dinlemesi
      // DİKKAT: Eğer konsolda '🏃 SignalR [Motion]' yazısını GÖREMEZSENİZ,
      // backend event isminiz 'Motion' değildir (örn: 'Motions' olabilir).
      this.signalR.on('Motion', (res) => {
        console.log('🏃 SignalR [Motion] Gelen Veri:', res); // Konsola yazdırıyoruz
        const existingSensorIndex = this.motions.findIndex(motion => motion.id === res.data.id);        
        if (existingSensorIndex !== -1) {
          this.motions[existingSensorIndex].value = res.data.value;
        }
        this.cdr.detectChanges(); // Ekranın anlık yenilenmesini sağlar
      });

      // Işık Şiddeti (LDR) Dinlemesi
      // DİKKAT: Eğer konsolda '☀️ SignalR [LDR]' yazısını GÖREMEZSENİZ,
      // backend event isminiz 'LDR' değildir (örn: 'Ldrs' olabilir).
      this.signalR.on('LDR', (res) => {
        console.log('☀️ SignalR [LDR] Gelen Veri:', res); // Konsola yazdırıyoruz
        const existingSensorIndex = this.ldrs.findIndex(ldr => ldr.id === res.data.id);        
        if (existingSensorIndex !== -1) {
          this.ldrs[existingSensorIndex].value = res.data.value;
        }
        this.cdr.detectChanges(); // Ekranın anlık yenilenmesini sağlar
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
  }

  // YENİ: Hareket Sensörlerini Filtreler (sensorType.value = 7 varsayıldı)
  getMotions(motions: SensorDataModel[]){
    motions = motions.filter(sensor => sensor.sensorType?.value === 7);
    this.motions = motions;
  }

  // YENİ: LDR Sensörlerini Filtreler (sensorType.value = 5 varsayıldı)
  getLdrs(ldrs: SensorDataModel[]){
    ldrs = ldrs.filter(sensor => sensor.sensorType?.value === 5);
    this.ldrs = ldrs;
  }

  getRoom() {
    this.http.get(`Rooms/GetAllByAppUserId?appUserId=${this.auth.user.id}`, (res) => {
      this.rooms = res.data;

      const allSensorDatas: SensorDataModel[] = this.rooms
        .flatMap(room => room.devices || [])
        .flatMap(device => device.sensorDatas || []);
  
      this.getHums(allSensorDatas);
      this.getTemps(allSensorDatas);
      this.getLights(allSensorDatas);
      this.getRelays(allSensorDatas);
      this.getMotions(allSensorDatas); // YENİ
      this.getLdrs(allSensorDatas);    // YENİ

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

      // YENİ: Hareket Sensörü (tip 5) olan odaları filtrele
      this.motionRooms = this.rooms.filter(room =>
        room.devices?.some(device =>
          device.sensorDatas?.some(sensor =>
            sensor.sensorType?.value === 7
          )
        )
      );

      // YENİ: LDR Sensörü (tip 6) olan odaları filtrele
      this.ldrRooms = this.rooms.filter(room =>
        room.devices?.some(device =>
          device.sensorDatas?.some(sensor =>
            sensor.sensorType?.value === 5
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