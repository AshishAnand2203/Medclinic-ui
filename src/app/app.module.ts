import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PageListComponent } from './pages/page/page-list/page-list.component';
import { PageAddComponent } from './pages/page/page-add/page-add.component';
import { PageEditComponent } from './pages/page/page-edit/page-edit.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ServiceListComponent } from './pages/service/service-list/service-list.component';
import { ServiceAddComponent } from './pages/service/service-add/service-add.component';
import { ServiceEditComponent } from './pages/service/service-edit/service-edit.component';
import { DoctorListComponent } from './pages/doctor/doctor-list/doctor-list.component';
import { DoctorAddComponent } from './pages/doctor/doctor-add/doctor-add.component';
import { DoctorEditComponent } from './pages/doctor/doctor-edit/doctor-edit.component';
import { SliderListComponent } from './pages/slider/slider-list/slider-list.component';
import { SliderAddComponent } from './pages/slider/slider-add/slider-add.component';
import { SliderEditComponent } from './pages/slider/slider-edit/slider-edit.component';
import { TestimonialListComponent } from './pages/testimonial/testimonial-list/testimonial-list.component';
import { TestimonialAddComponent } from './pages/testimonial/testimonial-add/testimonial-add.component';
import { TestimonialEditComponent } from './pages/testimonial/testimonial-edit/testimonial-edit.component';
import { BlogListComponent } from './pages/blog/blog-list/blog-list.component';
import { BlogAddComponent } from './pages/blog/blog-add/blog-add.component';
import { BlogEditComponent } from './pages/blog/blog-edit/blog-edit.component';
import { SettingsComponent } from './pages/settings/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    PageListComponent,
    PageAddComponent,
    PageEditComponent,
    ServiceListComponent,
    ServiceAddComponent,
    ServiceEditComponent,
    DoctorListComponent,
    DoctorAddComponent,
    DoctorEditComponent,
    SliderListComponent,
    SliderAddComponent,
    SliderEditComponent,
    TestimonialListComponent,
    TestimonialAddComponent,
    TestimonialEditComponent,
    BlogListComponent,
    BlogAddComponent,
    BlogEditComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CKEditorModule,
    ImageCropperModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
