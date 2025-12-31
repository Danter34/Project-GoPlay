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
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule {}
