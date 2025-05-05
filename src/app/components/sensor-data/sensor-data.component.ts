import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SensorDataModel, SensorType } from '../../models/sensor-data.model';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-sensor-data',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sensor-data.component.html',
  styleUrl: './sensor-data.component.css'
})
export class SensorDataComponent {
  sensorDataId:string = "";
  sensorDataModel:SensorDataModel = new SensorDataModel();

  sensorTypes:SensorType[] = [
      {name: "Other", value: 0},
      {name: "Light", value: 1},
      {name: "Relay", value: 2},
      {name: "Temperature", value: 3},
      {name: "Ldr", value: 4},
      {name: "Water", value: 5},
      {name: "Pressure", value: 6},
      {name: "Motion", value: 7},
      {name: "Speed", value: 8},
    ];

  constructor(
    private http:HttpService,
    private activated: ActivatedRoute,
  ){
    this.activated.params.subscribe((res) => {
      this.sensorDataId = res['id'];
    });
  }

  get(){
    this.http.get(`SensorDatas/Get?Id=${this.sensorDataId}`, (res) => {
      console.log(res.data);
      
    });
  }

  deleteById(){
    
  }
}
