import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  services: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadServices();

    setInterval(() => {
      this.loadServices();
    }, 5000);
  }

  loadServices() {
    this.api.getServices().subscribe({
      next: (res) => {
        this.services = res;
      }
    });
  }

  stop(id: string) {
    this.api.stopService(id).subscribe(() => {
      this.loadServices();
    });
  }

  restart(id: string) {
    this.api.restartService(id).subscribe(() => {
      this.loadServices();
    });
  }

  delete(id: string) {
    this.api.deleteService(id).subscribe(() => {
      this.loadServices();
    });
  }
}