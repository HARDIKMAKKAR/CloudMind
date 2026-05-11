import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  baseUrl = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  getServices() {
    return this.http.get<any[]>(`${this.baseUrl}/services`);
  }

  deploy(data: any) {
    return this.http.post(`${this.baseUrl}/deploy`, data);
  }

  getLogs(projectName: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/logs/${projectName}`
    );
  }

  getContainerLogs(serviceId: string) {
    return this.http.get<any>(
      `${this.baseUrl}/container-logs/${serviceId}`
    );
  }

  getMonitor(serviceId: string) {
    return this.http.get<any>(
      `${this.baseUrl}/monitor/${serviceId}`
    );
  }

  getMetrics(serviceId: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/metrics/${serviceId}`
    );
  }

  stopService(serviceId: string) {
    return this.http.post(
      `${this.baseUrl}/stop/${serviceId}`,
      {}
    );
  }

  restartService(serviceId: string) {
    return this.http.post(
      `${this.baseUrl}/restart/${serviceId}`,
      {}
    );
  }

  deleteService(serviceId: string) {
    return this.http.delete(
      `${this.baseUrl}/service/${serviceId}`
    );
  }
}