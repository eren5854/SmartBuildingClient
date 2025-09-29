import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginModel } from '../../models/login.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SwalService } from '../../services/swal.service';
import { Router, RouterLink } from '@angular/router';
import { UserModel } from '../../models/user.model';

@Component({
    selector: 'app-login',
    imports: [FormsModule, CommonModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  loginModel: LoginModel = new LoginModel();
  userModel: UserModel = new UserModel();

  // url:string = "https://apismartbuilding.erendelibas.xyz/api";
  url:string = "http://188.132.232.172:54080/api";
  // url:string = "http://100.127.177.109:54080/api";

  constructor(
    private http: HttpClient,
    private swal: SwalService,
    private router: Router
  ){}

  login(form:NgForm){    
    if (form.valid) {
      this.http.post(`${this.url}/Auth/Login`, this.loginModel)
      .subscribe({
        next:(res: any) => {
          console.log(res.data);
          localStorage.setItem("loginToken", res.data.token);
          // this.swal.callToast(res.message);
          this.router.navigateByUrl("/");
        },
        error:(err:HttpErrorResponse) => {
          console.log(err);
          this.swal.callToast2(err.error.errorMessages[0], 'warning');
        }
      });
    }
    else{
      console.log("Please fill the all area!!");
      
      this.swal.callToast2("Please fill the all area!!", 'warning')
    }
  }

  signup(form:NgForm){
    if (form.valid) {
      this.http.post(`${this.url}/Auth/Signup`, this.userModel)
      .subscribe({
        next: (res:any) => {
          console.log(res.data);
          this.swal.callToast(res.data, 'success');
          this.switchToLogin();
        },
        error:(err: HttpErrorResponse) => {
          console.log(err);
          this.swal.callToast(err.error.errorMessages[0], 'error');
        }

      });
    }
    else{
      this.swal.callToast("Please fill the all area!!", 'warning')
    }
  }

  togglePasswordVisibility(passwordFieldId: string, eyeIconId: string): void {
    const passwordField = document.getElementById(passwordFieldId) as HTMLInputElement;
    const eyeIcon = document.getElementById(eyeIconId);

    if (passwordField && eyeIcon) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
      } else {
        passwordField.type = 'password';
      }
      eyeIcon.classList.toggle('ri-eye-fill');
      eyeIcon.classList.toggle('ri-eye-off-fill');
    }
  }

  switchToRegister(): void {
    const loginAccessRegister = document.getElementById('loginAccessRegister');
    if (loginAccessRegister) {
      loginAccessRegister.classList.add('active');
    }
  }

  switchToLogin(): void {
    const loginAccessRegister = document.getElementById('loginAccessRegister');
    if (loginAccessRegister) {
      loginAccessRegister.classList.remove('active');
    }
  }
}
