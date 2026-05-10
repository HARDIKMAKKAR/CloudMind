import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  userName: string = "Hardik";

  logout() {
    console.log("User logged out");

    // later you can connect this with auth service
    // example:
    // this.authService.logout();
  }
}
