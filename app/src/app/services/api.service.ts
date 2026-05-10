import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  baseUrl = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  getServices() {
    return this.http.get(`${this.baseUrl}/services`);
  }

  deployService(data:any) {
    return this.http.post(`${this.baseUrl}/deploy`, data);
  }
}