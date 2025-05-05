import { Component } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SwalService } from '../../services/swal.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  userModel: UserModel = new UserModel();

  constructor(
    private http: HttpClient,
    private swal: SwalService,
    private router: Router
  ){}

  signup(form:NgForm){
    if (form.valid) {
      this.http.post("https://192.168.1.101:45455/api/Auth/Signup", this.userModel)
      .subscribe({
        next: (res:any) => {
          console.log(res.data);
          this.swal.callToast(res.data, 'success');
          this.router.navigateByUrl("/login");
          // this.switchToLogin();
        },
        error:(err: HttpErrorResponse) => {
          console.log(err);
          this.swal.callToast2(err.error.errorMessages[0], 'error');
        }

      });
    }
    else{
      this.swal.callToast2("Please fill the all area!!", 'warning')
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
