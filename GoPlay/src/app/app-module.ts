import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Để dùng ngModel tìm kiếm
import { RouterModule, Routes } from '@angular/router';

import { App } from './app';
import { HomeComponent } from './view/home/home.component';
import { FieldDetailComponent } from './view/field-detail/field-detail.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'field/:id', component: FieldDetailComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    App,
    HomeComponent,
    FieldDetailComponent,
    HeaderComponent, 
    FooterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }