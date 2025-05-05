import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserModel } from '../../models/user.model';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChangePasswordModel } from '../../models/change-password.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { TemplateSettingModel } from '../../models/template-setting.model';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  userModel: UserModel = new UserModel();
  changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  templateSettingModel: TemplateSettingModel = new TemplateSettingModel();

  secretToken: string = "";
  showSecretKey = false;

  selectedPrimaryBg: string = "";
  selectedNavHeaderBg: string = "";
  selectedHeaderBg: string = "";
  selectSidebarBg: string = "";
  colors: { value: string, color: string }[] = [
    { value: "color_1", color: "#fff" },
    { value: "color_2", color: "#6610f2" },
    { value: "color_3", color: "#886CC0" },
    { value: "color_4", color: "#4d06a5" },
    { value: "color_5", color: "#dc3545" },
    { value: "color_6", color: "#fd7e14" },
    { value: "color_7", color: "#ffc107" },
    { value: "color_8", color: "#ff5ed2" },
    { value: "color_9", color: "#20c997" },
    { value: "color_10", color: "#17a2b8" },
    { value: "color_11", color: "#94618E" },
    { value: "color_12", color: "#343a40" },
    { value: "color_13", color: "#83418b" },
    { value: "color_14", color: "#4885ed" },
    { value: "color_15", color: "#4cb32b" }
  ];

  selectedVersion: string = "";
  versions: { value: string, name: string }[] = [
    { value: "dark", name: "Dark" },
    { value: "light", name: "Light" }
  ];

  selectedLayout: string = "";
  layouts: { value: string, name: string }[] = [
    { value: "vertical", name: "Vertical" },
    { value: "horizontal", name: "Horizontal" }
  ];

  selectedHeaderPosition: string = "";
  headerPositions: { value: string, name: string }[] = [
    { value: "static", name: "Static" },
    { value: "fixed", name: "Fixed" }
  ]

  selectedSidebarPosition: string = "";
  sidebarPositions: { value: string, name: string }[] = [
    { value: "static", name: "Static" },
    { value: "fixed", name: "Fixed" }
  ]

  selectedSidebarStyle: string = "";
  sidebarStyles: { value: string, name: string }[] = [
    { value: "full", name: "Full" },
    { value: "mini", name: "Mini" },
    { value: "compact", name: "Compact" },
    { value: "modern", name: "Modern" },
    { value: "overlay", name: "Overlay" },
    { value: "icon-hover", name: "Icon-Hover" },

  ]

  selectedContainerLayout: string = "";
  containerLayouts: { value: string }[] = [
    { value: "wide" },
    { value: "boxed" },
    { value: "wide-boxed" }
  ];

  selectedTypography: string = "";
  typographies: { value: string, name: string }[] = [
    { value: "roboto", name: "Roboto" },
    { value: "poppins", name: "Poppins" },
    { value: "opensans", name: "Open Sans" },
    { value: "HelveticaNeue", name: "HelveticaNeue" },
  ]


  constructor(
    private http: HttpService,
    private swal: SwalService,
    public auth: AuthService,
    private router: Router,
    private clipboard: Clipboard
  ) {
    this.userModel = auth.user;
    this.secretToken = auth.secretToken;
    this.getTemplate();
  }

  update(form: NgForm) {
    // this.userModel.id = this.auth.user.id;
    if (form.valid) {
      this.http.post("Users/Update", this.userModel, (res) => {
        console.log(res.data);
        setTimeout(() => {
          localStorage.clear();
          this.router.navigateByUrl("/login");
        }, 1000);
      });
    }
  }

  changePassword(form: NgForm) {
    this.changePasswordModel.id = this.auth.user.id!;
    if (form.valid) {
      this.http.post("Auth/ChangePassword", this.changePasswordModel, (res) => {
        console.log(res.data);
        setTimeout(() => {
          localStorage.clear();
          this.router.navigateByUrl("/login");
        }, 1000);
      });
    }
  }

  generateSecretToken() {
    this.http.get(`Users/UpdateSecretToken?Id=${this.auth.user.id}`, (res) => {
      setTimeout(() => {
        localStorage.clear();
        this.router.navigateByUrl("/login");
      }, 1000);
    });
  }

  copyToClipboard(value: string) {
    this.clipboard.copy(value);
    alert('Secret Token kopyalandı!');
  }

  getTemplate() {
    this.http.get(`TemplateSettings/GetByUserId?Id=${this.auth.user.id}`, (res) => {
      this.templateSettingModel = res.data;
      console.log(this.templateSettingModel);
      this.selectedContainerLayout = this.templateSettingModel.containerLayout!;
      this.selectedVersion = this.templateSettingModel.version!;
      this.selectedLayout = this.templateSettingModel.layout!;
      this.selectedHeaderPosition = this.templateSettingModel.headerPosition!;
      this.selectedSidebarPosition = this.templateSettingModel.sidebarPosition!;
      this.selectedSidebarStyle = this.templateSettingModel.sidebarStyle!;
      this.selectedTypography = this.templateSettingModel.typography!;
    });
  }

  updateTemplate(form: NgForm) {
    if (form.valid) {
      this.http.post("TemplateSettings/Update", this.templateSettingModel, (res) => {
        console.log(res);
        setTimeout(() => {
          location.reload();
        }, 2000);
      })
    }
  }

  updateDefaultTemplate() {
    this.swal.callToastWithButton('Varsayılan verileri yüklemek istediğinize emin misiniz?', 'Evet', () => {
      this.templateSettingModel.containerLayout = "full";
      this.templateSettingModel.headerBg = "color_1";
      this.templateSettingModel.headerPosition = "fixed";
      this.templateSettingModel.layout = "vertical";
      this.templateSettingModel.navHeaderBg = "color_1";
      this.templateSettingModel.primary = "color_1";
      this.templateSettingModel.sidebarBg = "color_1";
      this.templateSettingModel.sidebarPosition = "fixed";
      this.templateSettingModel.sidebarStyle = "full";
      this.templateSettingModel.typography = "poppins";
      this.templateSettingModel.version = "dark";

      this.http.post("TemplateSettings/Update", this.templateSettingModel, (res) => {
        console.log(res);
        setTimeout(() => {
          location.reload();
        }, 2000);
      });
    });
  }

  setVersion(choice: string) {
    this.selectedVersion = choice;
    this.templateSettingModel.version = choice;
    document.cookie = `version=${choice}; path=/; max-age=31536000;`;
  }

  setPrimaryBg(choice: string): void {
    this.selectedPrimaryBg = choice;
    this.templateSettingModel.primary = choice;
    document.cookie = `primary=${choice}; path=/; max-age=31536000;`;
  }

  setNavHeaderBg(choice: string) {
    this.selectedNavHeaderBg = choice;
    this.templateSettingModel.navHeaderBg = choice;
    document.cookie = `navheaderBg=${choice}; path=/; max-age=31536000;`;
  }

  setHeaderBg(choice: string) {
    this.selectedHeaderBg = choice;
    this.templateSettingModel.headerBg = choice;
    document.cookie = `headerBg=${choice}; path=/; max-age=31536000;`;
  }

  setSidebarBg(choice: string) {
    this.selectSidebarBg = choice;
    this.templateSettingModel.sidebarBg = choice;
    document.cookie = `sidebarBg=${choice}; path=/; max-age=31536000;`;
  }

  setLayout(choice: string) {
    this.selectedLayout = choice;
    this.templateSettingModel.layout = choice;
    document.cookie = `layout=${choice}; path=/; max-age=31536000;`;
  }

  setHeaderPosition(choice: string) {
    this.selectedHeaderPosition = choice;
    this.templateSettingModel.headerPosition = choice;
    document.cookie = `headerPosition=${choice}; path=/; max-age=31536000;`;
  }

  setSidebarPosition(choice: string) {
    this.selectedSidebarPosition = choice;
    this.templateSettingModel.sidebarPosition = choice;
    document.cookie = `sidebarPosition=${choice}; path=/; max-age=31536000;`;
  }

  setSidebarStyle(choice: string) {
    this.selectedSidebarStyle = choice;
    this.templateSettingModel.sidebarStyle = choice;
    document.cookie = `sidebarStyle=${choice}; path=/; max-age=31536000;`;

  }

  setContainerLayout(choice: string) {
    this.selectedContainerLayout = choice;
    this.templateSettingModel.containerLayout = choice;
    document.cookie = `containerLayout=${choice}; path=/; max-age=31536000;`;
  }

  setTypography(choice: string) {
    this.selectedTypography = choice;
    this.templateSettingModel.typography = choice;
    document.cookie = `typography=${choice}; path=/; max-age=31536000;`;
  }
}
