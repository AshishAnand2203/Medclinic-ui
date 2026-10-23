import {
    Component,
    EventEmitter,
    Output
} from '@angular/core';

import { Router } from '@angular/router';

import { TokenStorageService } from '../../services/token-storage.service';


@Component({
  standalone: false,
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {

    @Output() toggleSidebar = new EventEmitter<void>();

    @Output() toggleMobileSidebar = new EventEmitter<void>();


    user: any;


    constructor(
        private tokenStorage: TokenStorageService,
        private router: Router
    ) {

        this.user = this.tokenStorage.getUser();

    }


    desktopToggle(): void {

        this.toggleSidebar.emit();

    }


    mobileToggle(): void {

        this.toggleMobileSidebar.emit();

    }


    logout(): void {

    // Clear token + user
    this.tokenStorage.clear();


    // Replace dashboard with login
    this.router.navigate(
        ['/admin/login'],
        {
            replaceUrl: true
        }
    );

}

}
