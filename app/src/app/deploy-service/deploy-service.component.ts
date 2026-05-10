import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-deploy-service',
  templateUrl: './deploy-service.component.html',
  styleUrl: './deploy-service.component.css'
})
export class DeployServiceComponent {
  service = {
    name:"",
    region:""
  }

  constructor(private api:ApiService){}

  deploy(){

    this.api.deployService(this.service).subscribe(res=>{
      alert("Deployment Started");
    })
  }
}
