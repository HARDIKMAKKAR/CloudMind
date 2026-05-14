import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  baseUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) {}

  /* -----------------------------
     AUTH
  ----------------------------- */

  register(data: any) {

    return this.http.post(
      `${this.baseUrl}/auth/register`,
      data
    );

  }

  login(data: any) {

    return this.http.post(
      `${this.baseUrl}/auth/login`,
      data
    );

  }

  /* -----------------------------
     SERVICES
  ----------------------------- */

  getServices() {

    return this.http.get<any[]>(
      `${this.baseUrl}/services`
    );

  }

  /* -----------------------------
     DEPLOY
  ----------------------------- */

  deployService(
    repoUrl: string,
    projectName: string
  ) {

    return this.http.post(
      `${this.baseUrl}/deploy`,
      {
        repoUrl,
        projectName
      }
    );

  }

  /* -----------------------------
     DEPLOYMENT LOGS
  ----------------------------- */

  getLogs(projectName: string) {

    return this.http.get<any[]>(
      `${this.baseUrl}/logs/${projectName}`
    );

  }

  /* -----------------------------
     CONTAINER LOGS
  ----------------------------- */

  getContainerLogs(serviceId: string) {

    return this.http.get<any>(
      `${this.baseUrl}/container-logs/${serviceId}`
    );

  }

  /* -----------------------------
     MONITORING
  ----------------------------- */

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

  /* -----------------------------
     SERVICE ACTIONS
  ----------------------------- */

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


  getIntelligence(serviceId: string) {
  return this.http.get<any>(
    `${this.baseUrl}/intelligence/${serviceId}`
  );
}

}