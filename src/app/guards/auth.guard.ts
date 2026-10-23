import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';


@Injectable({
    providedIn: 'root'
})
export class AuthGuard  {

    constructor(
        private tokenStorage: TokenStorageService,
        private router: Router
    ) {}


    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {

        // User is logged in
        if (this.tokenStorage.isLoggedIn()) {

            return true;

        }


        // User is NOT logged in
        return this.router.createUrlTree([
            '/admin/login'
        ]);

    }

}
