import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SwalService } from '../../services/swal.service';
import { ScenarioCreateUpdateModel } from '../../models/scenario-create.model';
import { SensorModel } from '../../models/sensor.model';
import { ScenarioModel } from '../../models/scenario.model';

@Component({
  selector: 'app-scenario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './scenario.component.html',
  styleUrl: './scenario.component.css'
})
export class ScenarioComponent {
  scenarioId:string = "";
  scenarioModel: ScenarioModel = new ScenarioModel();
  updateScenarioModel: ScenarioCreateUpdateModel = new ScenarioCreateUpdateModel();
  actionSensors:SensorModel[] = [];
  allSensors:SensorModel[] = [];

  triggerTypes: { id: number; name: string }[] = [
    { id: 0, name: 'Saat' },
    { id: 1, name: 'Sensor' }
  ];
  
  actionTypes: { id: number; name: string }[] = [
    { id: 0, name: 'Email' },
    { id: 1, name: 'Onn/Off' }
  ];

  selectedTriggerType: number = 0;
  selectedActionType: number = 0;
  selectedTriggerSensorId:string | null = null;
  selectedActionSensorId:string | null = null;

  constructor(
    private http: HttpService,
    public auth: AuthService,
    private activated: ActivatedRoute,
    private swal: SwalService
  ){
    this.activated.params.subscribe((res) => {
      this.scenarioId = res['id'];
    });
    this.get();
    this.getAllSensor();
  }

  get(){
    this.http.get(`Scenarios/GetById?Id=${this.scenarioId}`, (res) => {
      this.scenarioModel = res.data;
      
      this.updateScenarioModel.id = this.scenarioModel.id;
      this.updateScenarioModel.scenarioName = this.scenarioModel.scenarioName;
      this.updateScenarioModel.scenarioDescription = this.scenarioModel.scenarioDescription;
      this.updateScenarioModel.triggerSensorId = this.scenarioModel.triggerInfo?.triggerSensorInfo?.sensorId;
      this.updateScenarioModel.triggerType = this.scenarioModel.triggerInfo?.triggerType;
      this.updateScenarioModel.triggerValue = this.scenarioModel.triggerInfo?.triggerValue;
      this.updateScenarioModel.triggerTime = this.scenarioModel.triggerInfo?.triggerTime;
      this.updateScenarioModel.actionSensorId = this.scenarioModel.triggerInfo?.actionInfo?.actionSensorInfo?.sensorId;
      this.updateScenarioModel.actionType = this.scenarioModel.triggerInfo?.actionInfo?.actiontype;
      this.updateScenarioModel.actionValue = this.scenarioModel.triggerInfo?.actionInfo?.actionValue;
      
      this.selectedActionType = this.scenarioModel.triggerInfo?.triggerType;
      this.selectedTriggerSensorId = this.updateScenarioModel.triggerSensorId!;
      this.selectedActionSensorId = this.updateScenarioModel.actionSensorId!;
    })
  }

   getAllSensor(){
      this.http.get(`Sensors/GetAllSensorByUserId?Id=${this.auth.user.id}`, (res) => {
        this.allSensors = res.data;
        this.getLightRelay(res.data);
      })
    }
  
    getLightRelay(lightRelay: SensorModel[]){
      lightRelay = lightRelay.filter(sensor => sensor.sensorType === 1);
      this.actionSensors = lightRelay;
      console.log(this.actionSensors);
      
    }

  update(form:NgForm){
    this.updateScenarioModel.appUserId = this.auth.user.id!;
    
    if (form.valid) {
      this.http.post("Scenarios/Update", this.updateScenarioModel, (res) => {
        console.log(res.data);
        
      })
    }
  }

  setTriggerType(type: number) {
    this.updateScenarioModel.triggerType = type;
    this.selectedTriggerType = type;
    console.log(this.selectedTriggerType);
    // this.updateScenarioModel.triggerSensorId = "";
    // this.updateScenarioModel.triggerValue = 0;
    // this.updateScenarioModel.triggerTime = null;
  }

  setActionType(type: number) {
    this.updateScenarioModel.actionType = type;
    this.selectedActionType = type;
    console.log(this.selectedActionType);
  }

  setTriggerSensorId(id:string){
    this.updateScenarioModel.triggerSensorId =id;
    this.selectedTriggerSensorId = id;
    console.log(this.updateScenarioModel.actionSensorId);
    
  }

  setActionSensorId(id:string){
    this.updateScenarioModel.actionSensorId = id;
    this.selectedActionSensorId = id;
    console.log(this.updateScenarioModel.actionSensorId);
    
  }
}
