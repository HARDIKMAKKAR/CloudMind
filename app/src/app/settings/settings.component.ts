import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  constructor(private api: ApiService) {}

  services:any = [];

  ngOnInit(){
    this.api.getServices().subscribe((data:any)=>{
      this.services = data;
    });
  }
}
