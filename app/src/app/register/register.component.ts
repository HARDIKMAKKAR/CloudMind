import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';

  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  register() {

    this.loading = true;

    this.auth.register({
      name: this.name,
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
          err.error.error || 'Registration failed';

      }

    });

  }

}