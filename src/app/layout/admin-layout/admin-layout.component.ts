import { Component } from '@angular/core';

@Component({
  standalone: false,
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {

    sidebarCollapsed = false;

    mobileSidebarOpen = false;


    toggleSidebar(): void {

        this.sidebarCollapsed = !this.sidebarCollapsed;

    }


    toggleMobileSidebar(): void {

        this.mobileSidebarOpen = !this.mobileSidebarOpen;

    }


    closeMobileSidebar(): void {

        this.mobileSidebarOpen = false;

    }

}
