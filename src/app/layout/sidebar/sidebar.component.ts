import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() collapsed = false;

  @Input() mobileOpen = false;

  @Output() closeMobile = new EventEmitter<void>();

  menuItems = [
    {
      title: 'Dashboard',
      icon: 'fa-solid fa-gauge-high',
      route: '/dashboard',
    },
    {
      title: 'Sliders',
      icon: 'fa-regular fa-images',
      route: '/slider/list',
    },
    {
      title: 'Pages',
      icon: 'fa-regular fa-file-lines',
      route: '/page/list',
    },

    {
      title: 'Services',
      icon: 'fa-solid fa-stethoscope',
      route: '/service/list',
    },

    {
      title: 'Doctors',
      icon: 'fa-solid fa-user-doctor',
      route: '/doctor/list',
    },
    {
      title: 'Testimonials',
      icon: 'fa-regular fa-comment-dots',
      route: '/testimonial/list',
    },
    {
      title: 'Blog',
      icon: 'fa-regular fa-newspaper',
      route: '/blog/list',
    },

    {
      title: 'Enquiries',
      icon: 'fa-regular fa-envelope',
      route: '/enquiry/list',
    },

    {
      title: 'Settings',
      icon: 'fa-solid fa-gear',
      route: '/settings',
    },
  ];

  close(): void {
    this.closeMobile.emit();
  }
}
