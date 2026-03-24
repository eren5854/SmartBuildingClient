import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SensorDataModel, SensorType } from '../../models/sensor-data.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { Chart, registerables } from 'chart.js'
import { FlexiGridModule } from 'flexi-grid'
import { SensorDataHistoryModel } from '../../models/sensor-data-history.model';
Chart.register(...registerables);

@Component({
  selector: 'app-sensor-data',
  standalone: true, // Imports array kullanıyorsanız standalone true olmalı
  imports: [CommonModule, FormsModule, FlexiGridModule],
  templateUrl: './sensor-data.component.html',
  styleUrl: './sensor-data.component.css'
})
export class SensorDataComponent {
  sensorDataId: string = "";
  sensorDataModel: SensorDataModel = new SensorDataModel();
  
  // Filtrelenmiş veri için listeyi tutacağımız değişken
  filteredSensorDataHistories: SensorDataHistoryModel[] = [];

  // HTML'den ngModel ile bağlanacak tarih değişkenleri
  // Varsayılan olarak bugünü ve bugünden 1 ay öncesini atıyoruz
  filterStartDate: string = this.getDefaultStartDate();
  filterEndDate: string = this.getDefaultEndDate();

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

  chart: any; // Genel grafik
  chartWeek: any; // Haftalık grafik
  chartFiltered: any; // TARİHE GÖRE FİLTRELENMİŞ grafik için

  constructor(
    private http: HttpService,
    private activated: ActivatedRoute,
    private swal: SwalService,
    private router: Router
  ) {
    this.activated.params.subscribe((res) => {
      this.sensorDataId = res['id'];
      // this.get(); 
      // getfromDate'i constructor'da çağırmak yerine, 
      // HTML'den buton tıklamasıyla veya sayfa açıldığında ilk load için çağırabiliriz.
      this.getFromDate(); 
    });
  }

  // Tarihleri yyyy-MM-ddThh:mm formatında input="datetime-local" için hazırlayan yardımcı metotlar
  getDefaultStartDate(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // 1 ay önce
    return d.toISOString().slice(0, 16);
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

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

  get() {
    this.http.get(`SensorDatas/Get?Id=${this.sensorDataId}`, (res) => {
      this.sensorDataModel = res.data;

      const sortedHistories = this.sensorDataModel.sensorDataHistories!.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Genel veriler grafiği için label ve data
      const labels = sortedHistories.map(h => {
        const date = new Date(h.createdAt);
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      const data = sortedHistories.map(h => h.value);

      const weeklyHistories = sortedHistories.filter(h => this.isThisWeek(h.createdAt));
      const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      const groupedByDay: { [key: string]: number[] } = {};
      
      weeklyHistories.forEach(h => {
        const date = new Date(h.createdAt);
        const dayName = daysOfWeek[date.getDay()];
        if (!groupedByDay[dayName]) {
          groupedByDay[dayName] = [];
        }
        groupedByDay[dayName].push(h.value!);
      });

      const orderedDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const weekLabels: string[] = [];
      const weekData: number[] = [];

      orderedDays.forEach(day => {
        if (groupedByDay[day]) {
          weekLabels.push(day);
          const values = groupedByDay[day];
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          weekData.push(+average.toFixed(2));
        }
      });

      if (this.chart) this.chart.destroy();
      if (this.chartWeek) this.chartWeek.destroy();

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

      this.chartWeek = new Chart('MyWeekChart', {
        type: 'line',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Bu Haftanın Ortalaması',
            data: weekData,
            borderColor: 'rgb(255,99,132)',
            tension: 0.1,
            fill: false
          }]
        }
      });
    });
  }

  // YENİ VE DÜZENLENMİŞ: Tarihe göre getirme ve grafiği çizme metodu
  getFromDate() {
    // API'nin UTC beklentisini karşılamak için .toISOString() kullanabiliriz, 
    // veya input'tan gelen değeri doğrudan UTC 'Z' ekleyerek yollayabiliriz.
    // HTML input="datetime-local" den gelen değer: "2025-12-01T16:40" gibidir.
    const startUtc = new Date(this.filterStartDate).toISOString();
    const endUtc = new Date(this.filterEndDate).toISOString();

    this.http.get(`SensorDatas/GetFromDate?SensorDataId=${this.sensorDataId}&StartDate=${startUtc}&EndDate=${endUtc}`, (res) => {
      // API Result<List<SensorDataHistory>> dönüyor, veriyi alıyoruz
      this.filteredSensorDataHistories = res.data; 
      console.log(this.filteredSensorDataHistories);
      

      // Veriyi tarihe göre sıralayalım (Eğer backend sıralamıyorsa garantiye alalım)
      const sortedFilteredHistories = this.filteredSensorDataHistories.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Grafik için x ve y eksenlerini (label ve data) oluşturalım
      const labels = sortedFilteredHistories.map(h => {
        const date = new Date(h.createdAt);
        // Örn: 01/12 16:40 formatı
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      const data = sortedFilteredHistories.map(h => h.value);

      // Eğer daha önce çizilmiş filtrelenmiş grafik varsa temizle
      if (this.chartFiltered) {
         this.chartFiltered.destroy();
      }

      // Yeni filtreli grafiği çiz ('MyFilteredChart' id'li bir canvas HTML'de olmalı)
      this.chartFiltered = new Chart('MyFilteredChart', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `Veriler (${new Date(this.filterStartDate).toLocaleDateString()} - ${new Date(this.filterEndDate).toLocaleDateString()})`,
            data: data,
            borderColor: 'rgb(54, 162, 235)', // Mavi renk
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
          }]
        }
      });
    });
  }

  update(form: NgForm) {
    if (form.valid) {
      this.http.post("SensorDatas/Update", this.sensorDataModel, (res) => {
        this.get();
        // İsterseniz update sonrası filtreli grafiği de yenileyebilirsiniz.
        this.getFromDate(); 
      });
    }
  }

  deleteById() {
    this.swal.callToastWithButton('Silmek istediğinize emin misiniz?', 'Evet', () => {
      this.http.get(`SensorDatas/Delete?Id=${this.sensorDataId}`, (res) => {
        this.router.navigateByUrl("/sensors");
      });
    });
  }
}