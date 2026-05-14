import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitorComponent implements OnInit {

  serviceId = '';
  monitor: any;
  intelligence: any;

  latestMetrics = {
  cpu: 0,
  memory: 0,
  latency: 0
};
  // ✅ 30-min sliding buffer (clean structure)
  metricsBuffer: {
    x: number;
    cpu: number;
    memory: number;
    latency: number;
  }[] = [];

  // ---------------- CHARTS ----------------

  cpuChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        label: 'CPU Usage %',
        data: [],
        tension: 0.4,
        parsing: false
      }
    ]
  };

  memoryChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        label: 'Memory Usage %',
        data: [],
        tension: 0.4,
        parsing: false
      }
    ]
  };

  latencyChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        label: 'Latency (ms)',
        data: [],
        tension: 0.4,
        parsing: false
      }
    ]
  };

  // ---------------- OPTIONS ----------------
chartOptions: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  animation: false,
  parsing: false,
  scales: {
    x: {
      type: 'time'
    },
    y: {
      beginAtZero: true
    }
  }
};
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  // ---------------- INIT ----------------

  ngOnInit(): void {

    this.serviceId = this.route.snapshot.params['id'];

    this.loadMonitor();
    this.loadMetrics();
    this.loadIntelligence();

    setInterval(() => {
      this.loadMonitor();
      this.loadMetrics();
      this.loadIntelligence();
    },5000);
  }

  // ---------------- MONITOR ----------------

  loadMonitor() {
    this.api.getMonitor(this.serviceId).subscribe({
      next: (res) => {
        this.monitor = res;
      }
    });
  }

  // ---------------- METRICS (FIXED FULL VERSION) ----------------
// loadMetrics() {
//   this.api.getMetrics(this.serviceId).subscribe({
//     next: (res: any[]) => {

//       const THIRTY_MIN = 30 * 60 * 1000;
//       const now = Date.now();

//       const incoming = res.map(m => ({
//         x: new Date(m.timestamp).getTime(),
//         cpu: Number(m.cpu),
//         memory: Number(m.memory),
//         latency: Number(m.latency)
//       }));

//       this.metricsBuffer.push(...incoming);

//       // keep only last 30 min
//       this.metricsBuffer = this.metricsBuffer.filter(
//         m => now - m.x <= THIRTY_MIN
//       );

//       this.metricsBuffer.sort((a, b) => a.x - b.x);

//       const cpuSeries = this.metricsBuffer.map(m => ({ x: m.x, y: m.cpu }));

//       this.cpuChartData.datasets[0].data = cpuSeries;

//       // 🔥 FORCE Chart.js refresh (IMPORTANT)
//       this.cpuChartData = { ...this.cpuChartData };
//     }
//   });
// }
loadMetrics() {
  this.api.getMetrics(this.serviceId).subscribe({
    next: (res: any[]) => {

      const THIRTY_MIN = 5 * 60 * 1000;
      const now = Date.now();

      const incoming = res.map(m => ({
        x: new Date(m.timestamp).getTime(),
        cpu: Number(m.cpu),
        memory: Number(m.memory),
        latency: Number(m.latency)
      }));

      // 🔥 DO NOT MERGE FULL HISTORY AGAIN (IMPORTANT FIX)
      const existing = new Set(this.metricsBuffer.map(m => m.x));
      const newPoints = incoming.filter(m => !existing.has(m.x));

      this.metricsBuffer.push(...newPoints);

      // keep last 30 min only
      this.metricsBuffer = this.metricsBuffer.filter(
        m => now - m.x <= THIRTY_MIN
      );

      // ❌ IMPORTANT: do NOT constantly sort deeply (kills spike feel)
      // only sort new array once lightly
      this.metricsBuffer.sort((a, b) => a.x - b.x);

      // build series
      const cpuSeries = this.metricsBuffer.map(m => ({
        x: m.x,
        y: m.cpu
      }));

      const memorySeries = this.metricsBuffer.map(m => ({
        x: m.x,
        y: m.memory
      }));

      const latencySeries = this.metricsBuffer.map(m => ({
        x: m.x,
        y: m.latency
      }));

      // 🔥 IMPORTANT FIX: DO NOT recreate full object every time
      // just mutate dataset (keeps chart “alive”)

      this.cpuChartData.datasets[0].data = cpuSeries;
      this.memoryChartData.datasets[0].data = memorySeries;
      this.latencyChartData.datasets[0].data = latencySeries;
    }
  });const now = Date.now();

(this.chartOptions!.scales as any).x = {
  type: 'time',
  min: now - 5 * 60 * 1000,
  max: now,
  time: {
    unit: 'minute',
    displayFormats: {
      minute: 'HH:mm'
    }
  }
};

const latest = this.metricsBuffer[this.metricsBuffer.length - 1];

if (latest) {
  this.latestMetrics = {
    cpu: latest.cpu,
    memory: latest.memory,
    latency: latest.latency
  };
}
// 2. force chart re-render
this.cpuChartData = { ...this.cpuChartData };
this.memoryChartData = { ...this.memoryChartData };
this.latencyChartData = { ...this.latencyChartData };
}
  // ---------------- INTELLIGENCE ----------------

  loadIntelligence() {
    this.api.getIntelligence(this.serviceId).subscribe({
      next: (res) => {
        this.intelligence = res;
      }
    });
  }
}