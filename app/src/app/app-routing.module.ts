import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicesComponent } from './services/services.component';
import { DeployServiceComponent } from './deploy-service/deploy-service.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { LogsComponent } from './logs/logs.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent },

  { path: 'services', component: ServicesComponent },

  { path: 'deploy', component: DeployServiceComponent },

  { path: 'monitoring', component: MonitoringComponent },

  { path: 'logs', component: LogsComponent },

  { path: 'settings', component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
