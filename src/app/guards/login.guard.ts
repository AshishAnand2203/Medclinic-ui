import { Injectable } from '@angular/core';

import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';


@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(
        private tokenStorage: TokenStorageService,
        private router: Router
    ) {}


    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {

        // Already logged in
        // Do not allow login page

        if (this.tokenStorage.isLoggedIn()) {

            return this.router.createUrlTree([
                '/dashboard'
            ]);

        }


        return true;

    }

}
