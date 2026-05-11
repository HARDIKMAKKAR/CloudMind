import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.component.html'
})
export class LogsComponent implements OnInit {

  logs: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {

    const projectName =
      this.route.snapshot.params['projectName'];

    this.api.getLogs(projectName).subscribe({
      next: (res) => {
        this.logs = res;
      }
    });
  }
}