import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import { DashboardComponent }
from './dashboard/dashboard.component';

import { ServicesComponent }
from './services/services.component';

import { DeployComponent }
from './deploy-service/deploy-service.component';

import { MonitorComponent }
from './monitoring/monitoring.component';

import { LogsComponent }
from './logs/logs.component';

import { SettingsComponent }
from './settings/settings.component';

import { LoginComponent }
from './login/login.component';

import { RegisterComponent }
from './register/register.component';

import { LandingComponent }
from './landing/landing.component';

import { authGuard }
from './guards/auth.guard';

const routes: Routes = [

  {
    path: '',
    component: LandingComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  {
    path: 'services',
    component: ServicesComponent,
    canActivate: [authGuard]
  },

  {
    path: 'deploy',
    component: DeployComponent,
    canActivate: [authGuard]
  },

  {
    path: 'monitor/:id',
    component: MonitorComponent,
    canActivate: [authGuard]
  },

  {
    path: 'logs',
    component: LogsComponent,
    canActivate: [authGuard]
  },

  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {}