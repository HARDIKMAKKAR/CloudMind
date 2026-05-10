import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  constructor(private api: ApiService) {}

  services:any = [];

  ngOnInit(){
    console.log('OnInIt of Services called !!')
    this.api.getServices().subscribe((data:any)=>{
      console.log('Services api called');
      this.services = data;
    });
  }
}
