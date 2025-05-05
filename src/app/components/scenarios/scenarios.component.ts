import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { ScenarioModel } from '../../models/scenario.model';
import { RouterLink } from '@angular/router';
import { SwalService } from '../../services/swal.service';
import { ScenarioCreateUpdateModel } from '../../models/scenario-create.model';
import { SensorModel } from '../../models/sensor.model';
import { MailSettingModel } from '../../models/mail-setting.model';
declare var $:any;

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './scenarios.component.html',
  styleUrl: './scenarios.component.css'
})
export class ScenariosComponent {
  scenarios: ScenarioModel[] = [];
  scenarioModel: ScenarioCreateUpdateModel = new ScenarioCreateUpdateModel();
  actionSensors:SensorModel[] = [];
  allSensors:SensorModel[] = [];
  mailSettingModel: MailSettingModel = new MailSettingModel();

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
    private swal: SwalService
  ) {
    this.get();
    this.getAllSensor();
    this.getMailSetting();
  }

  get() {
    this.http.get(`Scenarios/GetAllScenarioByUserId?Id=${this.auth.user.id}`, (res) => {
      this.scenarios = res.data;
      console.log(this.scenarios);
    });
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

  create(form: NgForm) {
    this.scenarioModel.appUserId = this.auth.user.id!;
  
    if(this.scenarioModel.triggerType == 0){
      // triggerTime dönüşümü (elle ISO formatı oluştur)
      const today = new Date();
      const [hours, minutes] = this.scenarioModel.triggerTime.split(":").map(Number);
    
      // Tarih stringini elle oluştur
      const formattedTriggerTime = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
    
      this.scenarioModel.triggerTime = formattedTriggerTime;
    
      console.log(this.scenarioModel.triggerTime); // Örn: 2024-12-17T05:02:00.000Z
    }
  
    if (form.valid) {
      this.http.post("Scenarios/Create", this.scenarioModel, (res) => {
        console.log(res.data);
        location.reload();
      });
    }
  }

  updateIsActive(id: string, isActive: boolean) {
    var message = "";
    if (isActive) {
      message = 'Deaktif etmek istediğinize emin misiniz?'
    }
    else {
      message = 'Aktif etmek istediğinize emin misiniz?'
    }
    this.swal.callToastWithButton(message, 'Evet', () => {
      this.http.get(`Scenarios/UpdateIsActive?Id=${id}`, (res) => {
        console.log(res.data);
        this.get();
      });
    });
  }

  deleteById(id: string) {
    this.swal.callToastWithButton('Silmek istediğinize emin misiniz?', 'Evet', () => {
      this.http.get(`Scenarios/DeleteById?Id=${id}`, (res) => {
        console.log(res.data);
        this.get();
      });
    });
  }

  getMailSetting(){
    this.http.get(`MailSettings/GetByUserId?Id=${this.auth.user.id}`, (res) => {
      this.mailSettingModel = res.data;
    });
  }

  updateMailSetting(form:NgForm){
    if (form.valid) {
      this.http.post("MailSettings/Update", this.mailSettingModel, (res) => {
        this.get();
        this.getAllSensor();
        this.getMailSetting();
      })
    }
  }

  setTriggerType(type: number) {
    this.scenarioModel.triggerType = type;
    this.selectedTriggerType = type;
    console.log(this.selectedTriggerType);
    this.scenarioModel.triggerSensorId = "";
    this.scenarioModel.triggerValue = 0;
    this.scenarioModel.triggerTime = null;
  }

  setActionType(type: number) {
    this.scenarioModel.actionType = type;
    this.selectedActionType = type;
    console.log(this.selectedActionType);
  }

  setTriggerSensorId(id:string){
    this.scenarioModel.triggerSensorId =id;
    this.selectedTriggerSensorId = id;
    console.log(this.scenarioModel.actionSensorId);
    
  }

  setActionSensorId(id:string){
    this.scenarioModel.actionSensorId = id;
    this.selectedActionSensorId = id;
    console.log(this.scenarioModel.actionSensorId);
    
  }
}
