import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RemoteControlKeyModel } from '../../models/remote-control-key.model';

@Component({
  selector: 'app-remote-control',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './remote-control.component.html',
  styleUrl: './remote-control.component.css'
})
export class RemoteControlComponent {
  remoteControlKeyId:string = "";
  remoteControlKeys:RemoteControlKeyModel[] = [];
  remoteControlName?:string;

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private activated: ActivatedRoute
  ){
    this.activated.params.subscribe((res) => {
      this.remoteControlKeyId = res['id'];
      console.log(this.remoteControlKeyId);  
    });

    this.get();
  }

  get(){
    this.http.get(`RemoteControls/GetById?Id=${this.remoteControlKeyId}`, (res) => {
      this.remoteControlName = res.data.name;
      this.remoteControlKeys = res.data.remoteControlKeys;
      console.log(this.remoteControlKeys);
    });
  }

  update(form:NgForm, remoteControlKey:RemoteControlKeyModel){
    remoteControlKey.keyValue = false;
    if (form.valid) {
      this.http.post("RemoteControlKeys/Update", remoteControlKey, (res) => {
        console.log(res.data);
        this.get();
      });
    }
  }
}
