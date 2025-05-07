import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomModel } from '../../models/room.model';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SensorModel } from '../../models/sensor.model';
import { DeviceModel } from '../../models/device.model';

@Component({
    selector: 'app-room',
    imports: [FormsModule, CommonModule, RouterLink],
    templateUrl: './room.component.html',
    styleUrl: './room.component.css'
})
export class RoomComponent {
  roomId:string="";
  roomModel: RoomModel = new RoomModel();
  // sensors: SensorModel[] = [];
  devices: DeviceModel[] = [];

  sensorType: string[] = [
    "Other",
    "Light",
    "Relay",
    "Temperature",
    "Humidity",
    "Ldr",
    "Water",
    "Pressure",
    "Motion",
    "Speed"
  ]

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public auth: AuthService,
    private activated: ActivatedRoute,
    private router: Router
  ){
    this.activated.params.subscribe((res) => {
      this.roomId = res['id'];
      console.log(this.roomId);  
    });
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     // Navigasyon her sona erdiğinde verileri güncelle
    //     location.reload();
    //   }
    // });
    this.get();
  }

  get(){
    this.http.get(`Rooms/Get?Id=${this.roomId}`, (res) => {
      this.roomModel = res.data;
      // this.sensors = this.roomModel.getAllSensor!;
      console.log(this.roomModel);
      // console.log(this.sensors);
    });
  }

  update(form:NgForm){
    this.roomModel.id = this.roomId;
    this.roomModel.appUserId = this.auth.user.id!;
    if (form.valid) {
      this.http.post("Rooms/Update", this.roomModel, (res) => {
        console.log(res.data);
        this.get();
      });
    }
  }

  deleteById(){
    this.swal.callToastWithButton('Silmek istediğinize emin misiniz?', 'Evet', () => {
      this.http.get(`Rooms/Delete?Id=${this.roomId}`, (res) => {
        console.log(res.data);
        this.router.navigateByUrl("/rooms");
      });
    });
  }
}
