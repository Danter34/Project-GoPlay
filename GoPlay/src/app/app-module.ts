import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';

import { App } from './app';
import { HomeComponent } from './view/home/home.component';
import { FieldDetailComponent } from './view/field-detail/field-detail.component';
import { SearchResultComponent } from './view/search-result/search-result.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapSearchComponent } from './view/map-search/map-search.component';
import { RegisterComponent } from './view/auth/register/register.component';
import { LoginComponent } from './view/auth/login/login.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { OwnerRegisterComponent } from './view/owner-register/owner-register.component';
import { OwnerLayoutComponent } from './shared/owner-layout/owner-layout.component';
import { OwnerDashboardComponent } from './view/owner/owner-dashboard/owner-dashboard.component';
import { FieldSaveComponent } from './view/owner/field-save/field-save.component';
@NgModule({
  declarations: [
    App,
    HomeComponent,
    FieldDetailComponent,
    SearchResultComponent,
    HeaderComponent,
    FooterComponent,
    MapSearchComponent,
    RegisterComponent,
    LoginComponent,
    OwnerRegisterComponent,
    OwnerLayoutComponent,
    OwnerDashboardComponent,
    FieldSaveComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    GoogleMapsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule {}
