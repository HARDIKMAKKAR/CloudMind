import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicesComponent } from './services/services.component';
import { DeployComponent } from './deploy-service/deploy-service.component';
import { MonitorComponent } from './monitoring/monitoring.component';
import { LogsComponent } from './logs/logs.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent },

  { path: 'services', component: ServicesComponent },

  { path: 'deploy', component: DeployComponent },

  { path: 'monitoring', component: MonitorComponent },

  { path: 'logs', component: LogsComponent },

  { path: 'settings', component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
