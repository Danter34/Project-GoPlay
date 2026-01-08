import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './view/home/home.component';
import { FieldDetailComponent } from './view/field-detail/field-detail.component';
import { SearchResultComponent } from './view/search-result/search-result.component';
import { MapSearchComponent } from './view/map-search/map-search.component';
import { LoginComponent } from './view/auth/login/login.component';
import { RegisterComponent } from './view/auth/register/register.component';
import { OwnerRegisterComponent } from './view/owner-register/owner-register.component';
import { OwnerLayoutComponent } from './shared/owner-layout/owner-layout.component';
import { OwnerDashboardComponent } from './view/owner/owner-dashboard/owner-dashboard.component';
import { OwnerGuard } from './core/guards/owner-guard';
import { FieldSaveComponent } from './view/owner/field-save/field-save.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'field/:id', component: FieldDetailComponent },
  { path: 'search', component: SearchResultComponent },
  { path: 'map', component: MapSearchComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'owner/register', component: OwnerRegisterComponent },
  {
    path: 'owner',
    component: OwnerLayoutComponent,
    canActivate: [OwnerGuard],
    children: [
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'field/create', component: FieldSaveComponent },
      { path: 'field/edit/:id', component: FieldSaveComponent },
    ]
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
