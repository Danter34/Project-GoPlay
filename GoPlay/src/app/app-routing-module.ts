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
import { OwnerProfile } from './models/owner-profile.model';
import { OwnerProfileComponent } from './view/owner/owner-profile/owner-profile.component';
import { UserProfileComponent } from './view/user-profile/user-profile.component';
import { ChatComponent } from './view/chat/chat.component';
import { MyBookingsComponent } from './view/my-bookings/my-bookings.component';
import { BookingListComponent } from './view/owner/booking-list/booking-list.component';
import { PaymentReturnComponent } from './view/payment-return/payment-return.component';
import { StatisticsComponent } from './view/owner/statistics/statistics.component';
import { AdminLayoutComponent } from './shared/admin-layout/admin-layout.component';
import { ApproveOwnerComponent } from './view/admin/approve-owner/approve-owner.component';
import { UserManagementComponent } from './view/admin/user-management/user-management.component';
import { adminGuard } from './core/guards/admin-guard';
import { DashboardComponent } from './view/admin/dashboard/dashboard.component';
import { PartnerDetailComponent } from './view/admin/partner-detail/partner-detail.component';
import { SportTypeManagementComponent } from './view/admin/sport-type-management/sport-type-management.component';
import { TimeSlotManagementComponent } from './view/admin/time-slot-management/time-slot-management.component';
import { ContactComponent } from './view/contact/contact.component';
import { NewsPageComponent } from './view/news-page/news-page.component';
import { AdminNewsComponent } from './view/admin/admin-news/admin-news.component';
import { AdminContactComponent } from './view/admin/admin-contact/admin-contact.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'payment-return', component: PaymentReturnComponent },
  { path: 'field/:id', component: FieldDetailComponent },
  { path: 'search', component: SearchResultComponent },
  { path: 'map', component: MapSearchComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'owner/register', component: OwnerRegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'news', component: NewsPageComponent },
  {
    path: 'owner',
    component: OwnerLayoutComponent,
    canActivate: [OwnerGuard],
    children: [
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'field/create', component: FieldSaveComponent },
      { path: 'field/edit/:id', component: FieldSaveComponent },
      { path: 'profile', component: OwnerProfileComponent },
      { path: 'booking', component: BookingListComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'statistics', component: StatisticsComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard], // Nhớ tạo Guard check role='Admin'
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'approve-owners', component: ApproveOwnerComponent },
      {path: 'news', component: AdminNewsComponent},
      {path:'contacts', component:AdminContactComponent},
      { 
        path: 'users', 
        component: UserManagementComponent, 
        data: { type: 'user' } // Đánh dấu đây là trang User
      },
      { 
        path: 'partners', 
        component: UserManagementComponent, 
        data: { type: 'owner' } // Đánh dấu đây là trang Chủ sân
      },
      { path: 'partners', component: UserManagementComponent, data: { type: 'owner' } },
      { path: 'sport-types', component: SportTypeManagementComponent },
      { path: 'time-slots', component: TimeSlotManagementComponent },
      
      { path: 'partners/:id', component: PartnerDetailComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'profile', component: UserProfileComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'chat', component: ChatComponent},
  { path: 'chat/:id', component: ChatComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
