import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HashLocationStrategy, LocationStrategy } from '@angular/common'; 

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
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { OwnerRegisterComponent } from './view/owner-register/owner-register.component';
import { OwnerLayoutComponent } from './shared/owner-layout/owner-layout.component';
import { OwnerDashboardComponent } from './view/owner/owner-dashboard/owner-dashboard.component';
import { FieldSaveComponent } from './view/owner/field-save/field-save.component';
import { OwnerProfileComponent } from './view/owner/owner-profile/owner-profile.component';
import { StatisticsComponent } from './view/owner/statistics/statistics.component';
import { BookingListComponent } from './view/owner/booking-list/booking-list.component';

import { UserProfileComponent } from './view/user-profile/user-profile.component';
import { ChatComponent } from './view/chat/chat.component';
import { BookingModalComponent } from './view/booking-modal/booking-modal.component';
import { MyBookingsComponent } from './view/my-bookings/my-bookings.component';
import { PaymentReturnComponent } from './view/payment-return/payment-return.component';
import { ReviewModalComponent } from './view/review-modal/review-modal.component';

import { AdminLayoutComponent } from './shared/admin-layout/admin-layout.component';
import { ApproveOwnerComponent } from './view/admin/approve-owner/approve-owner.component';
import { UserManagementComponent } from './view/admin/user-management/user-management.component';
import { DashboardComponent } from './view/admin/dashboard/dashboard.component';
import { PartnerDetailComponent } from './view/admin/partner-detail/partner-detail.component';
import { SportTypeManagementComponent } from './view/admin/sport-type-management/sport-type-management.component';
import { TimeSlotManagementComponent } from './view/admin/time-slot-management/time-slot-management.component';

import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ContactComponent } from './view/contact/contact.component';
import { AdminContactComponent } from './view/admin/admin-contact/admin-contact.component';
import { AdminNewsComponent } from './view/admin/admin-news/admin-news.component';
import { NewsPageComponent } from './view/news-page/news-page.component';

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
    FieldSaveComponent,
    OwnerProfileComponent,
    StatisticsComponent,
    BookingListComponent,

    UserProfileComponent,
    ChatComponent,
    BookingModalComponent,
    MyBookingsComponent,
    PaymentReturnComponent,
    ReviewModalComponent,

    AdminLayoutComponent,
    ApproveOwnerComponent,
    UserManagementComponent,
    DashboardComponent,
    PartnerDetailComponent,
    SportTypeManagementComponent,
    TimeSlotManagementComponent,
    ContactComponent,
    AdminContactComponent,
    AdminNewsComponent,
    NewsPageComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    GoogleMapsModule,
    BaseChartDirective
  ],
  providers: [
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [App]
})
export class AppModule {}
