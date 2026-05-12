import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private router : Router){}
  userName: string = "Hardik";

  logout() {

  localStorage.clear();

  this.router.navigate([' ']);

}
}
