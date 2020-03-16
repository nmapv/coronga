import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../tools/loading.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('chartConfirmed') chartConfirmed;
  @ViewChild('chartRecoverd') chartRecoverd;
  @ViewChild('chartDeaths') chartDeaths;
  public confirmed: number = 0;
  public recovered: number = 0;
  public deaths: number = 0;

  public percent_confirmed: number = 0;
  public percent_recovered: number = 0;
  public percent_deaths: number = 0;

  private url: string = "https://coronavirus-tracker-api.herokuapp.com/all";
  bars: any;

  constructor(private http: HttpClient, private loading: LoadingService) {

  }

  ionViewDidEnter() {
    this.GetInformationFromApi();
  }

  GetInformationFromApi() {
    this.loading.present();
    this.http.get(this.url, {})
      .subscribe(
        data => {
          this.confirmed = data.confirmed.latest;
          this.recovered = data.recovered.latest;
          this.deaths = data.deaths.latest;

          this.percent_confirmed = Math.round((this.confirmed / 7700000000 * 100) * 1000) / 1000;
          this.percent_recovered = Math.round((this.recovered / this.confirmed * 100) * 10) / 10;
          this.percent_deaths = Math.round((this.deaths / this.confirmed * 100) * 10) / 10;

          this.createBarChart(data);

          console.log(data);
        },
        err => { console.log(err); },
        () => { this.loading.dismiss(); }
      );
  }



  createBarChart(data) {
    new Chart(this.chartConfirmed.nativeElement, {
      type: 'bar',
      data: {
        labels: this.filterInformation(data.confirmed.locations).map(a => a.country),
        datasets: [{
          label: 'TOP 10 Countries',
          data: this.filterInformation(data.confirmed.locations).map(a => a.qty),
          backgroundColor: 'rgb(0,0,0)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(0,0,0)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });

    new Chart(this.chartRecoverd.nativeElement, {
      type: 'bar',
      data: {
        labels: this.filterInformation(data.recovered.locations).map(a => a.country),
        datasets: [{
          label: 'TOP 10 Countries',
          data: this.filterInformation(data.recovered.locations).map(a => a.qty),
          backgroundColor: 'rgb(0,0,0)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(0,0,0)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });

    new Chart(this.chartDeaths.nativeElement, {
      type: 'bar',
      data: {
        labels: this.filterInformation(data.deaths.locations).map(a => a.country),
        datasets: [{
          label: 'TOP 10 Countries',
          data: this.filterInformation(data.deaths.locations).map(a => a.qty),
          backgroundColor: 'rgb(0,0,0)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(0,0,0)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  filterInformation(arr) {
    var result = [];

    arr.reduce(function (res, value) {
      if (!res[value.country]) {
        res[value.country] = { country: value.country, qty: 0 };
        result.push(res[value.country])
      }
      res[value.country].qty += value.latest;
      return res;
    }, {});

    return result.sort((a, b) => (a.qty > b.qty) ? -1 : 1).slice(0, 10);
  }
}
