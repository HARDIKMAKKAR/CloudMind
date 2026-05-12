import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  styleUrl : './landing.component.css',
  templateUrl: './landing.component.html'
})

export class LandingComponent
implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {

    const token =
      localStorage.getItem('token');

    if (token) {

      this.router.navigate(['/dashboard']);

    }

  }

}