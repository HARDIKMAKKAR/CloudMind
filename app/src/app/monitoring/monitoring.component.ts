import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.component.html'
})
export class MonitorComponent implements OnInit {

  monitor: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {

    const serviceId =
      this.route.snapshot.params['id'];

    this.loadMonitor(serviceId);

    setInterval(() => {
      this.loadMonitor(serviceId);
    }, 5000);
  }

  loadMonitor(serviceId: string) {

    this.api.getMonitor(serviceId).subscribe({
      next: (res) => {
        this.monitor = res;
      }
    });
  }
}