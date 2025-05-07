import { Component, AfterViewInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SensorModel } from '../../models/sensor.model';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomModel } from '../../models/room.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { LightTimeLogModel } from '../../models/light-time-log.model';
import { DeviceModel, DeviceType } from '../../models/device.model';
import { SensorDataModel, SensorType } from '../../models/sensor-data.model';

declare var $: any;

@Component({
  selector: 'app-sensor',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements AfterViewInit {
  deviceId: string = "";
  deviceModel: DeviceModel = new DeviceModel();
  sensorDataModel: SensorDataModel = new SensorDataModel();
  updateSensorDataModel: SensorDataModel = new SensorDataModel();

  roomId: string = "";
  rooms: RoomModel[] = [];
  lightTimeLogs: LightTimeLogModel[] = [];
  selectedRoomId: string | null = null;
  total?: number;
  data: any;

  sensorTypes: SensorType[] = [
    { name: "Other", value: 0 },
    { name: "Light", value: 1 },
    { name: "Relay", value: 2 },
    { name: "Temperature", value: 3 },
    { name: "Humidity", value: 4 },
    { name: "LDR", value: 5 },
    { name: "Pressure", value: 6 },
    { name: "Motion", value: 7 },
    { name: "Speed", value: 8 },
  ];

  deviceTypes: DeviceType[] = [
    { name: "Other", value: 0 },
    { name: "Esp32", value: 1 },
    { name: "Esp01", value: 2 },
    { name: "Nodemcu", value: 3 },
    { name: "RaspberryPi", value: 4 },
    { name: "Arduino", value: 5 }
  ];


  constructor(
    private http: HttpService,
    private swal: SwalService,
    public auth: AuthService,
    private activated: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard
  ) {
    this.activated.params.subscribe((res) => {
      this.deviceId = res['id'];
    });
    this.get();
    this.getRoom();
  }

  showSecretKey = false;
  copyToClipboard(value: string) {
    this.clipboard.copy(value);
    alert('Secret Key kopyalandı!');
  }

  get() {
    this.http.get(`Devices/Get?Id=${this.deviceId}`, (res) => {
      this.deviceModel = res.data;
      console.log(this.deviceModel);
      this.selectedRoomId = this.deviceModel.roomId;
      this.lightTimeLogs = res.data.lightTimeLogs;
    });
  }

  update(form: NgForm) {
    if (form.valid) {
      this.http.post("Devices/Update", this.deviceModel, (res) => {
        console.log(res.data);
        this.get();
      });
    }
  }

  createSensor(form: NgForm) {
    this.sensorDataModel.deviceId = this.deviceId;
    if (form.valid) {
      this.http.post("SensorDatas/Create", this.sensorDataModel, (res) => {
        console.log(res.data);
        this.get();
      });
    }
  }

  setRoomId(id: string) {
    this.selectedRoomId = id;
  }

  deleteById() {
    this.swal.callToastWithButton('Silmek istediğinize emin misiniz?', 'Evet', () => {
      this.http.get(`Devices/Delete?Id=${this.deviceId}`, (res) => {
        console.log(res.data);
        this.router.navigateByUrl("/sensors");
      });
    });
  }

  getRoom() {
    this.http.get(`Rooms/GetAllByAppUserId?appUserId=${this.auth.user.id}`, (res) => {
      this.rooms = res.data;
    });
  }

  generateSecretKey() {
    this.http.get(`Devices/UpdateSecretKey?Id=${this.deviceModel.id}`, (res) => {
      console.log(res.data);
      this.swal.callToast2(res.data, 'info');
      this.get();
    })
  }

  

  getLightTimeLogDaily() {
    // this.http.get(`LightTimeLogs/GetAllBySensorIdDaily?Id=${this.sensorId}`, (res) => {
    //   this.lightTimeLogs = res.data;
    //   console.log(this.lightTimeLogs);
    //   // this.LineChart(this.lightTimeLogs);
    // });

    this.http.get(`LightTimeLogs/GetAllBySensorIdDaily?Id=${this.deviceId}`, (res) => {
      this.lightTimeLogs = res.data;
      console.log(this.lightTimeLogs);
      // Veriyi formatlayalım
      const formattedData = this.lightTimeLogs.map((log, index) => {
        const startDate = new Date(log.startDate);
        const formattedStartDate = `${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        log.timeCount = log.timeCount! / 60;
        console.log(log.timeCount);
        return [index, log.timeCount]; // X için index, Y için timeCount
      });

      const xTicks = this.lightTimeLogs.map((log, index) => {
        const startDate = new Date(log.startDate);
        const formattedStartDate = `${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2, '0')}:${startDate.getSeconds().toString().padStart(2, '0')}`;
        return [formattedStartDate]; // X ekseni için tick
      });

      const xTicks2 = this.lightTimeLogs.map((log, index) => {
        const finishDate = new Date(log.finishDate);
        const formattedFinishDate = `${finishDate.getHours()}:${finishDate.getMinutes().toString().padStart(2, '0')}:${finishDate.getSeconds().toString().padStart(2, '0')}`;
        return [formattedFinishDate]; // X ekseni için tick
      });
      console.log(xTicks2);

      // Grafiği başlat
      this.initializeFlotBarChart2(formattedData, xTicks, xTicks2);
    });
  }

  getLightTimeLogWeekly() {
    this.http.get(`LightTimeLogs/GetDailyTotalsBySensorIdWeekly?Id=${this.deviceId}`, (res) => {
      const data = res.data;
      console.log(res.data);


      // data'nın türünü kontrol edelim
      if (!Array.isArray(data)) {
        // data bir dizi değilse, nesneyi diziye dönüştürelim
        const dataArray = Object.entries(data).map(([date, value]) => ({
          date,
          value: Number(value) // Burada value'yu number tipine çeviriyoruz
        }));

        // Günlerin sıralarını belirleyelim (Pazartesi=0, Salı=1, ... Pazar=6)
        const daysOfWeek = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

        // Veriyi formatlayalım
        const formattedData = dataArray.map((item) => {
          const dayIndex = new Date(item.date).getDay() - 1; // -1 yaparak günü sıfırdan başlatırız (Pazartesi=0)
          const minutes = item.value / 60; // Saniyeden dakikaya çevirme
          return [dayIndex * 2, minutes]; // 0, 2, 4, 6, 8, 10, 12 gibi artan index
        });

        this.initializeFlotBarChart(formattedData);
        // this.initializeFlotBarChart2(formattedData);

      } else {
        // Eğer data zaten bir dizi ise, direkt formatlayalım
        const formattedData = data.map((item) => {
          const dayIndex = new Date(item.date).getDay() - 1; // -1 yaparak günü sıfırdan başlatırız (Pazartesi=0)
          const minutes = Number(item.value) / 60; // value'yu number tipine çevirme ve saniyeden dakikaya çevirme
          return [dayIndex * 2, minutes]; // 0, 2, 4, 6, 8, 10, 12 gibi artan index
        });

        this.initializeFlotBarChart(formattedData);
      }
    });
  }

  lightTimeLogTotal() {
    for (let i = 0; i < this.lightTimeLogs.length; i++) {
      this.total = + this.lightTimeLogs[i].timeCount!;
    }
    console.log(this.total);

  }

  ngAfterViewInit(): void {
    this.LineChart(this.lightTimeLogs);
  }

  private initializeFlotBarChart(data: any[]): void {
    const daysOfWeek = [
      [0, 'P'], [2, 'S'], [4, 'Ç'],
      [6, 'P'], [8, 'C'], [10, 'C'], [12, 'P']
    ];

    const options = {
      series: {
        bars: {
          show: true,
          lineWidth: 0,
          fillColor: '#4dedf5',
          barWidth: 0.3,
          align: 'center'
        }
      },
      grid: {
        borderWidth: 1,
        borderColor: '#ccc',
        tickColor: '#e5e5e5',
        markings: function (axes: any) {
          const markings = [];
          for (let x = Math.ceil(axes.xaxis.min); x < axes.xaxis.max; x++) {
            markings.push({ xaxis: { from: x, to: x }, color: '#f9f9f9', lineWidth: 0.2 });
          }
          for (let y = Math.ceil(axes.yaxis.min); y < axes.yaxis.max; y += 10) {
            markings.push({ yaxis: { from: y, to: y }, color: '#f9f9f9', lineWidth: 0.2 });
          }
          return markings;
        }
      },
      yaxis: {
        tickSize: 30,
        tickColor: 'transparent',
        font: {
          color: '#f0a907',
          size: 12
        }
      },
      xaxis: {
        ticks: daysOfWeek,
        tickColor: 'transparent',
        font: {
          color: '#f0a907',
          size: 12
        }
      }
    };

    const plot = $.plot("#flotBar1", [{ data: data }], options);

    // Barların üzerine değer yazdırma
    const ctx = plot.getCanvas().getContext("2d");
    const offset = plot.getPlotOffset();

    ctx.font = "12px Arial";
    ctx.fillStyle = "#f0a907"; // Yazı rengi

    data.forEach(([x, y]: [number, number]) => {
      const pos = plot.p2c({ x, y });
      ctx.fillText(y.toFixed(1), pos.left + offset.left - 10, pos.top + offset.top - 10); // Değerlerin pozisyonunu ayarlayın
    });
  }

  private initializeFlotBarChart2(data: any[], xTicks: any[], xTicks2: any[]): void {

    // xTicks ve xTicks2'yi birleştirin, xTicks2'yi '-' ekleyerek ekleyin
    const combinedTicks = [];

    // xTicks'i ve xTicks2'yi sayısal pozisyonlarla birleştir
    for (let i = 0; i < xTicks.length; i++) {
      // xTicks[i] ve xTicks2[i] değerlerini birleştir
      const tickLabel = xTicks[i] + ' - ' + xTicks2[i];
      // Sayısal pozisyon (index) ve etiket kombinasyonu ekle
      combinedTicks.push([i, tickLabel]);  // i sayısal pozisyon, tickLabel etiket
    }
    console.log(combinedTicks);

    $.plot("#flotBar2", [
      {
        data: data, // Dinamik veri
        bars: {
          show: true,
          lineWidth: 0,
          fillColor: '#4dedf5',
          barWidth: 0.1,
          align: 'center'
        },
      },
    ], {
      grid: {
        borderWidth: 1, // Dış çerçeve genişliği
        borderColor: '#ccc', // Dış çerçeve rengi
        tickColor: '#e5e5e5', // Izgara çizgilerinin rengi
        markings: function (axes: any) { // Ekstra kılavuz çizgileri eklemek için
          const markings = [];
          for (let x = Math.ceil(axes.xaxis.min); x < axes.xaxis.max; x++) {
            markings.push({ xaxis: { from: x, to: x }, color: '#f9f9f9', lineWidth: 0.2 });
          }
          for (let y = Math.ceil(axes.yaxis.min); y < axes.yaxis.max; y++) {
            markings.push({ yaxis: { from: y, to: y }, color: '#f9f9f9', lineWidth: 0.2 });
          }
          return markings;
        },
      },
      yaxis: {
        tickSize: 5,
        tickColor: 'transparent',
        font: {
          color: '#f0a907',
          size: 12,
        },
      },
      xaxis: {
        ticks: combinedTicks, // X ekseni için zaman etiketleri
        tickColor: 'transparent',
        font: {
          color: '#f0a907',
          size: 12,
        },
      },
    });
  }

  private LineChart(data: LightTimeLogModel[]): void {
    const plotData = data
      .filter(log => log.finishDate && log.timeCount !== undefined)
      .map((log, index) => {
        const finishDate = new Date(log.finishDate);
        const hours = finishDate.getHours();
        const minutes = finishDate.getMinutes();
        const timeInHours = hours + minutes / 60;
        return [timeInHours, log.timeCount as number];
      });

    $.plot($('#flotLine1'), [
      {
        data: plotData,
        label: 'Time Count',
        color: '#ffaa2b'
      }
    ],
      {
        series: {
          lines: {
            show: true,
            lineWidth: 1
          },
          shadowSize: 0
        },
        points: {
          show: false,
        },
        legend: {
          noColumns: 1,
          position: 'nw'
        },
        grid: {
          hoverable: true,
          clickable: true,
          borderColor: '#ddd',
          borderWidth: 0,
          labelMargin: 5,
          backgroundColor: 'transparent'
        },
        yaxis: {
          min: 0,
          max: Math.max(...data.map(log => log.timeCount ?? 0)) + 5,
          color: 'transparent',
          font: {
            size: 10,
            color: '#999'
          }
        },
        xaxis: {
          tickDecimals: 1,
          tickSize: 1,
          color: 'transparent',
          font: {
            size: 10,
            color: '#999'
          }
        }
      });
  }

}