import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SensorDataModel, SensorType } from '../../models/sensor-data.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { Chart, registerables } from 'chart.js'
import { config } from 'rxjs';
Chart.register(...registerables);

@Component({
  selector: 'app-sensor-data',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sensor-data.component.html',
  styleUrl: './sensor-data.component.css'
})
export class SensorDataComponent {
  sensorDataId: string = "";
  sensorDataModel: SensorDataModel = new SensorDataModel();
  sensorDataModelSort:SensorDataModel = new SensorDataModel();

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

  constructor(
    private http: HttpService,
    private activated: ActivatedRoute,
    private swal: SwalService,
    private router: Router
  ) {
    this.activated.params.subscribe((res) => {
      this.sensorDataId = res['id'];
    });
    this.get();
  }

  // public config: any = {
  //   type: 'line',
  //   data: {
  //     labels: ['12:00', '13:00', '14:00'],
  //     datasets: [
  //       {
  //         label:'Line Chart',
  //         data: this.sensorDataModel.sensorDataHistories,
  //         fill: false,
  //         borderColor: 'rgb(75,192,192)',
  //         tension: 0.1
  //       }
  //     ]

  //   },
  // };

  chart: any;
  chartDay:any;
  chartWeek: any; // Yeni grafik için değişken

  isThisWeek(dateString: string): boolean {
    const now = new Date();
    const inputDate = new Date(dateString);
  
    const currentDay = now.getDay();
    const diffToMonday = (currentDay + 6) % 7;
  
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
  
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
  
    return inputDate >= startOfWeek && inputDate <= endOfWeek;
  }
  

  // get() {
  //   this.http.get(`SensorDatas/Get?Id=${this.sensorDataId}`, (res) => {
  //     this.sensorDataModel = res.data;

  //     // createdAt'e göre artan şekilde sırala
  //     const sortedHistories = this.sensorDataModel.sensorDataHistories!.sort((a, b) => {
  //       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  //     });

  //     const labels = sortedHistories.map(h => {
  //       const date = new Date(h.createdAt);
  //       return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  //     });

  //     const data = sortedHistories.map(h => h.value);

  //     // Eski grafik varsa sil
  //     if (this.chart) {
  //       this.chart.destroy();
  //     }

  //     // Yeni grafik oluştur
  //     this.chart = new Chart('MyChart', {
  //       type: 'line',
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: 'Sensor Data',
  //             data: data,
  //             fill: false,
  //             borderColor: 'rgb(75,192,192)',
  //             tension: 0.1
  //           }
  //         ]
  //       }
  //     });
  //   });
  // }

  get() {
    this.http.get(`SensorDatas/Get?Id=${this.sensorDataId}`, (res) => {
      this.sensorDataModel = res.data;
      this.sensorDataModelSort = res.data;
      console.log(res);
  
      // createdAt'e göre sırala
      const sortedHistories = this.sensorDataModel.sensorDataHistories!.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  
      // Genel veriler
      const labels = sortedHistories.map(h => {
        const date = new Date(h.createdAt);
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      const data = sortedHistories.map(h => h.value);
  
      // Haftalık veriler
      const weeklyHistories = sortedHistories.filter(h => this.isThisWeek(h.createdAt));
  
      // Gün isimleri
      const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  
      // Günlere göre grupla
      const groupedByDay: { [key: string]: number[] } = {};
      weeklyHistories.forEach(h => {
        const date = new Date(h.createdAt);
        const dayName = daysOfWeek[date.getDay()];
        if (!groupedByDay[dayName]) {
          groupedByDay[dayName] = [];
        }
        groupedByDay[dayName].push(h.value!);
      });
  
      // Gün isimlerini sıraya koy
      const orderedDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
      const weekLabels: string[] = [];
      const weekData: number[] = [];
  
      orderedDays.forEach(day => {
        if (groupedByDay[day]) {
          weekLabels.push(day);
          // Günlük ortalama al (veya ilk veri)
          const values = groupedByDay[day];
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          weekData.push(+average.toFixed(2)); // Ondalık sayıyı yuvarla
        }
      });
  
      // Eski grafik varsa sil
      if (this.chart) this.chart.destroy();
      if (this.chartWeek) this.chartWeek.destroy();
  
      console.log("Tüm veri adedi:", sortedHistories.length);
      console.log("Haftalık veri adedi:", weeklyHistories.length);
      console.log("Haftalık veriler:", weeklyHistories);
  
      // Genel grafik
      this.chart = new Chart('MyChart', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Tüm Veriler',
            data: data,
            borderColor: 'rgb(75,192,192)',
            tension: 0.1,
            fill: false
          }]
        }
      });
  
      // Haftalık grafik
      this.chartWeek = new Chart('MyWeekChart', {
        type: 'line',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Bu Haftanın Verileri',
            data: weekData,
            borderColor: 'rgb(255,99,132)',
            tension: 0.1,
            fill: false
          }]
        }
      });
    });
  }
  

  // get() {
  //   this.http.get(`SensorDatas/Get?Id=${this.sensorDataId}`, (res) => {
  //     this.sensorDataModel = res.data;
  //     this.sensorDataModelSort = res.data;
  //     console.log(res);
      
  
  //     // createdAt'e göre sırala
  //     const sortedHistories = this.sensorDataModel.sensorDataHistories!.sort((a, b) =>
  //       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  //     );
  
  //     // Bugünün tarihini al
  //     const today = new Date();
  //     const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Bugün saat 00:00:00
  //     const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Bugün saat 23:59:59
  
  //     // Bugüne ait verileri filtrele
  //     const todaysHistories = sortedHistories.filter(h => {
  //       const createdAt = new Date(h.createdAt);
  //       return createdAt >= todayStart && createdAt < todayEnd;
  //     });
  
  //     // Saat dilimlerine göre grupla
  //     const hourlyData: { [hour: number]: number[] } = {};
  //     todaysHistories.forEach(h => {
  //       const createdAt = new Date(h.createdAt);
  //       const hour = createdAt.getHours(); // Saat bilgisi
  //       if (!hourlyData[hour]) {
  //         hourlyData[hour] = [];
  //       }
  //       hourlyData[hour].push(h.value!); // O saat dilimine ait veriyi ekle
  //     });
  
  //     // Saatlik verilerin ortalamasını hesapla
  //     const hourlyLabels: string[] = [];
  //     const hourlyValues: number[] = [];
  //     for (let hour = 0; hour < 24; hour++) {
  //       hourlyLabels.push(`${hour}:00`);
  //       const values = hourlyData[hour] || []; // O saat için veriler varsa al, yoksa boş dizi
  //       const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  //       hourlyValues.push(+average.toFixed(2)); // Ortalama değeri yuvarla
  //     }
  
  //     // Eski grafik varsa sil
  //     if (this.chart) this.chart.destroy();
  //     if (this.chartWeek) this.chartWeek.destroy();
  
  //     console.log("Bugün verileri:", todaysHistories.length);
  
  //     // Bugün için saatlik grafik
  //     this.chart = new Chart('MyDayChart', {
  //       type: 'line',
  //       data: {
  //         labels: hourlyLabels,
  //         datasets: [{
  //           label: 'Bugün Verileri (Saatlik)',
  //           data: hourlyValues,
  //           borderColor: 'rgb(54,162,235)',
  //           tension: 0.1,
  //           fill: false
  //         }]
  //       }
  //     });
  
  //     // Haftalık veriler (Mevcut koddan devam)
  //     const weeklyHistories = sortedHistories.filter(h => this.isThisWeek(h.createdAt));
  //     const weekLabels = weeklyHistories.map(h => {
  //       const date = new Date(h.createdAt);
  //       return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  //     });
  //     const weekData = weeklyHistories.map(h => h.value);
  
  //     // Haftalık grafik
  //     this.chartWeek = new Chart('MyWeekChart', {
  //       type: 'line',
  //       data: {
  //         labels: weekLabels,
  //         datasets: [{
  //           label: 'Bu Haftanın Verileri',
  //           data: weekData,
  //           borderColor: 'rgb(255,99,132)',
  //           tension: 0.1,
  //           fill: false
  //         }]
  //       }
  //     });
  
  //     // Genel grafik
  //     const labels = sortedHistories.map(h => {
  //       const date = new Date(h.createdAt);
  //       return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  //     });
  //     const data = sortedHistories.map(h => h.value);
  
  //     this.chart = new Chart('MyChart', {
  //       type: 'line',
  //       data: {
  //         labels: labels,
  //         datasets: [{
  //           label: 'Tüm Veriler',
  //           data: data,
  //           borderColor: 'rgb(75,192,192)',
  //           tension: 0.1,
  //           fill: false
  //         }]
  //       }
  //     });
  //   });
  // }
  
  

  update(form: NgForm) {
    if (form.valid) {
      this.http.post("SensorDatas/Update", this.sensorDataModel, (res) => {
        console.log(res);
        this.get();
      });
    }
  }

  deleteById() {
    this.swal.callToastWithButton('Silmek istediğinize emin misiniz?', 'Evet', () => {
      this.http.get(`SensorDatas/Delete?Id=${this.sensorDataId}`, (res) => {
        console.log(res.data);
        this.router.navigateByUrl("/sensors");
      });
    });
  }
}
