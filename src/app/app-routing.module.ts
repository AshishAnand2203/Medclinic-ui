import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

import { APP_CONFIG } from './config/app.config';

// =========================================================
// PAGE
// =========================================================

import { PageListComponent } from './pages/page/page-list/page-list.component';
import { PageAddComponent } from './pages/page/page-add/page-add.component';
import { PageEditComponent } from './pages/page/page-edit/page-edit.component';

// =========================================================
// SERVICE
// =========================================================

import { ServiceListComponent } from './pages/service/service-list/service-list.component';
import { ServiceAddComponent } from './pages/service/service-add/service-add.component';
import { ServiceEditComponent } from './pages/service/service-edit/service-edit.component';

// =========================================================
// DOCTOR
// =========================================================

import { DoctorListComponent } from './pages/doctor/doctor-list/doctor-list.component';
import { DoctorAddComponent } from './pages/doctor/doctor-add/doctor-add.component';
import { DoctorEditComponent } from './pages/doctor/doctor-edit/doctor-edit.component';

// =========================================================
// SLIDER
// =========================================================

import { SliderListComponent } from './pages/slider/slider-list/slider-list.component';
import { SliderAddComponent } from './pages/slider/slider-add/slider-add.component';
import { SliderEditComponent } from './pages/slider/slider-edit/slider-edit.component';

// =========================================================
// TESTIMONIALS
// =========================================================

import { TestimonialListComponent } from './pages/testimonial/testimonial-list/testimonial-list.component';
import { TestimonialAddComponent } from './pages/testimonial/testimonial-add/testimonial-add.component';
import { TestimonialEditComponent } from './pages/testimonial/testimonial-edit/testimonial-edit.component';

// =========================================================
// TESTIMONIALS
// =========================================================

import { BlogListComponent } from './pages/blog/blog-list/blog-list.component';
import { BlogAddComponent } from './pages/blog/blog-add/blog-add.component';
import { BlogEditComponent } from './pages/blog/blog-edit/blog-edit.component';

// =========================================================
// Settings
// =========================================================

import { SettingsComponent } from './pages/settings/settings/settings.component';

const routes: Routes = [
  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'admin/login',
    pathMatch: 'full',
  },

  // =========================================================
  // LOGIN
  // Logged-in users cannot access this
  // =========================================================

  {
    path: 'admin/login',
    component: LoginComponent,
    canActivate: [LoginGuard],
    title: `Admin Login | ${APP_CONFIG.projectName}`,
  },

  // =========================================================
  // PROTECTED ADMIN AREA
  // =========================================================

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],

    children: [
      // =====================================================
      // DASHBOARD
      // =====================================================

      {
        path: 'dashboard',
        component: DashboardComponent,
        title: `Dashboard | ${APP_CONFIG.projectName}`,
      },

      // =====================================================
      // PAGE MANAGEMENT
      // =====================================================

      {
        path: 'page/list',
        component: PageListComponent,
        title: `Pages | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'page/add',
        component: PageAddComponent,
        title: `Add Page | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'page/edit/:id',
        component: PageEditComponent,
        title: `Edit Page | ${APP_CONFIG.projectName}`,
      },

      // =====================================================
      // SERVICE MANAGEMENT
      // =====================================================

      {
        path: 'service/list',
        component: ServiceListComponent,
        title: `Services | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'service/add',
        component: ServiceAddComponent,
        title: `Add Service | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'service/edit/:id',
        component: ServiceEditComponent,
        title: `Edit Service | ${APP_CONFIG.projectName}`,
      },

      // =====================================================
      // DOCTOR MANAGEMENT
      // =====================================================

      {
        path: 'doctor/list',
        component: DoctorListComponent,
        title: `Doctors | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'doctor/add',
        component: DoctorAddComponent,
        title: `Add Doctor | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'doctor/edit/:id',
        component: DoctorEditComponent,
        title: `Edit Doctor | ${APP_CONFIG.projectName}`,
      },

      // =====================================================
      // SLIDER MANAGEMENT
      // =====================================================

      {
        path: 'slider/list',
        component: SliderListComponent,
        title: `Sliders | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'slider/add',
        component: SliderAddComponent,
        title: `Add Slider | ${APP_CONFIG.projectName}`,
      },

      {
        path: 'slider/edit/:id',
        component: SliderEditComponent,
        title: `Edit Slider | ${APP_CONFIG.projectName}`,
      },

      // =========================================================
      // TESTIMONIALS
      // =========================================================

      {
        path: 'testimonial/list',
        component: TestimonialListComponent,
        title: `Testimonials | ${APP_CONFIG.projectName}`,
      },
      {
        path: 'testimonial/add',
        component: TestimonialAddComponent,
        title: `Add Testimonial | ${APP_CONFIG.projectName}`,
      },
      {
        path: 'testimonial/edit/:id',
        component: TestimonialEditComponent,
        title: `Edit Testimonial | ${APP_CONFIG.projectName}`,
      },

      // =========================================================
      // TESTIMONIALS
      // =========================================================
      {
        path: 'blog/list',
        component: BlogListComponent,
        title: `Blogs | ${APP_CONFIG.projectName}`,
      },
      {
        path: 'blog/add',
        component: BlogAddComponent,
        title: `Add Blog | ${APP_CONFIG.projectName}`,
      },
      {
        path: 'blog/edit/:id',
        component: BlogEditComponent,
        title: `Edit Blog | ${APP_CONFIG.projectName}`,
      },
      {
        path: 'settings',
        component: SettingsComponent,
        title: `Settings | ${APP_CONFIG.projectName}`,
      },
    ],
  },

  // =========================================================
  // NOT FOUND
  // =========================================================

  {
    path: '**',
    redirectTo: 'admin/login',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
    }),
  ],

  exports: [RouterModule],
})
export class AppRoutingModule {}
