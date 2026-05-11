import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-deploy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deploy-service.component.html'
})
export class DeployComponent {

  repoUrl = '';
  projectName = '';

  message = '';

  constructor(private api: ApiService) {}

  deploy() {

    this.api.deploy({
      repoUrl: this.repoUrl,
      projectName: this.projectName
    }).subscribe({

      next: (res: any) => {
        this.message = res.message;
      },

      error: (err) => {
        this.message = err.error.error;
      }

    });
  }
}