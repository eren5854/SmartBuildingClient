import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { SwalService } from '../../services/swal.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RemoteControlModel } from '../../models/remote-control.model';
import { RemoteControlKeyModel } from '../../models/remote-control-key.model';

@Component({
  selector: 'app-remote-controls',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './remote-controls.component.html',
  styleUrl: './remote-controls.component.css'
})
export class RemoteControlsComponent {
  // remoteControlId:string = "";
  name:string = "";
  description?:string;
  remoteControls: RemoteControlModel[] = [];
  remoteControlKeyModel: RemoteControlKeyModel = new RemoteControlKeyModel();
  setRemoteControlId?:string;

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private swal: SwalService,
  ){
    this.get();
  }

  get(){
    this.http.get(`RemoteControls/GetAllByUserId?Id=${this.auth.user.id}`, (res) => {
      this.remoteControls = res.data;
      console.log(this.remoteControls);
    });
  }

  create(form:NgForm){
    if (form.valid) {
      this.http.post("RemoteControls/Create", {name: this.name, description :this.description, appUserId: this.auth.user.id}, (res) => {
        location.reload();
      });
    }
  }

  update(form:NgForm){
    if(form.valid){
      this.http.post("RemoteControls/Update", {id: this.setRemoteControlId, name: this.name, description :this.description}, (res) => {
        console.log(res.data);
        location.reload();
      })
    }
  }

  deleteById(){
    this.swal.callToastWithButton('Silmek istediğinize emin misiniz?', 'Evet', () => {
      this.http.get(`RemoteControls/DeleteById?Id=${this.setRemoteControlId}`, (res) => {
        console.log(res.data);
        location.reload();
      });
    });
  }

  updateRemoteControlKey(id:string, keyName:string, keyCode:string){
    this.remoteControlKeyModel.id = id;
    this.remoteControlKeyModel.keyName = keyName;
    this.remoteControlKeyModel.keyCode = keyCode;
    this.remoteControlKeyModel.keyValue = true;
    console.log(this.remoteControlKeyModel);
    this.http.post("RemoteControlKeys/Update", this.remoteControlKeyModel, (res) => {
      console.log(res.data);
      this.remoteControlKeyModel = new RemoteControlKeyModel();
      console.log(this.remoteControlKeyModel);
      this.get();
    });
  }
}
