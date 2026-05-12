import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deploy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./deploy-service.component.css'],
  templateUrl: './deploy-service.component.html'
})

export class DeployComponent {

  repoUrl = '';
  projectName = '';

  message = '';

  logs: any[] = [];

  polling: any;

  deploymentCompleted = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  deploy() {

    this.logs = [];
    this.deploymentCompleted = false;

    this.api.deployService(
      this.repoUrl,
      this.projectName
    ).subscribe({

      next: (res: any) => {

        this.message = res.message;

        this.startPollingLogs();
      },

      error: (err) => {

        this.message = err.error.error;
      }

    });

  }

  startPollingLogs() {

    this.polling = setInterval(() => {

      this.api
        .getLogs(this.projectName)
        .subscribe((res: any) => {

          this.logs = res;

          const completed =
            this.logs.find(
              (log: any) =>
                log.message.includes(
                  'Deployment completed successfully'
                )
            );

          const failed =
            this.logs.find(
              (log: any) =>
                log.message.includes(
                  'Deployment failed'
                )
            );

          if (completed || failed) {

            this.deploymentCompleted = true;

            clearInterval(this.polling);
          }

        });

    }, 2000);

  }

  goToServices() {

    this.router.navigate(['/services']);

  }

}