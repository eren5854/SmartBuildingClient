import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DeviceModel } from '../../models/device.model';
import { SensorDataModel } from '../../models/sensor-data.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-charts',
    imports: [FormsModule, CommonModule],
    templateUrl: './charts.component.html',
    styleUrl: './charts.component.css'
})
export class ChartsComponent {
  sensorDataId:string = "";

  devices: DeviceModel[] = [];
  sensorDatas: SensorDataModel[] = [];

  constructor(
    private http: HttpService,
    private activated: ActivatedRoute,
    private auth: AuthService 
  ){
    this.activated.params.subscribe((res) => {
      this.sensorDataId = res['id'];
    });

    this.get(this.sensorDataId);
    this.getAllDeviceByUserId();
  }

  getAllDeviceByUserId(){
    this.http.get(`Devices/GetAllByAppUserId?AppUserId=${this.auth.user.id}`, (res) => {
      this.devices = res.data;
      
      console.log(this.devices);
    });
  }

  get(id:string){
    this.http.get(`SensorDatas/Get?Id=${id}`, (res) => {
      this.sensorDatas = res.data,
      console.log(this.sensorDatas);
    });
  }

  // getAll(){
  //   this.http.get(`SensorDatas/Get?Id=`, (res) => {
  //     console.log(res);
      
  //   });
  // }
}
