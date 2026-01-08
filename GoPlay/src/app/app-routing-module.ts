import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './view/home/home.component';
import { FieldDetailComponent } from './view/field-detail/field-detail.component';
import { SearchResultComponent } from './view/search-result/search-result.component';
import { MapSearchComponent } from './view/map-search/map-search.component';
import { LoginComponent } from './view/auth/login/login.component';
import { RegisterComponent } from './view/auth/register/register.component';
import { OwnerRegisterComponent } from './view/owner-register/owner-register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'field/:id', component: FieldDetailComponent },
  { path: 'search', component: SearchResultComponent },
  { path: 'map', component: MapSearchComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'owner/register', component: OwnerRegisterComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
