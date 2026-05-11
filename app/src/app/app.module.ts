import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicesComponent } from './services/services.component';
import { DeployComponent } from './deploy-service/deploy-service.component';
import { MonitorComponent } from './monitoring/monitoring.component';
import { LogsComponent } from './logs/logs.component';
import { SettingsComponent } from './settings/settings.component';
import { SidebarComponent } from './sidebar/sidebar.component';
// import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import {
  withInterceptors
} from '@angular/common/http';

import { authInterceptor }
from './interceptors/auth.interceptor';
import { LandingComponent } from './landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    ServicesComponent,
    SettingsComponent,
    SidebarComponent,
    LoginComponent,
    RegisterComponent,
    LandingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
 providers: [

  provideHttpClient(
    withInterceptors([
      authInterceptor
    ])
  )

],
  bootstrap: [AppComponent]
})
export class AppModule { }
