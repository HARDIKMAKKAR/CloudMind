import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';

  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {

    this.loading = true;
    this.error = '';

    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (res: any) => {

        this.auth.saveAuth(
          res.token,
          res.user
        );

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.loading = false;

        this.error =
          err.error.error || 'Login failed';

      }

    });

  }

}