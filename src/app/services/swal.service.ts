import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class SwalService {

  callToast(message: string, icon: SweetAlertIcon = "success"){
    const Toast = Swal.mixin({
        toast: true,
        title: message,
        position: 'bottom-end',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
    });
    Toast.fire(message, '', icon)
  }
  // callToastGetUserInfo(message: string, icon: SweetAlertIcon = "success"){
  //   const Toast = Swal.mixin({
  //       toast: true,
  //       title: 'Kayıtlar Yüklendi',
  //       position: 'bottom-end',
  //       timer: 3000,
  //       timerProgressBar: true,
  //       showConfirmButton: false
  //   });
  //   Toast.fire(message, '', icon)
  // }

  callToast2(message: string, iconx: any) {
    Swal.fire({
      icon: iconx,
      text:message,
      timer: 3000,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false
    });
  }
  
  callToastRegisterSuccess(message: string, icon: SweetAlertIcon = "success"){
    const Toast = Swal.mixin({
        toast: true,
        title: 'Kayıt Başarılı',
        position: 'bottom-end',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
    });
    Toast.fire(message, '', icon)
  }

  callToastWithButton(message: string, buttonText: string, callback: () => void) {
    Swal.fire({
      title: message,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: buttonText,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  }
}
export type SweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'