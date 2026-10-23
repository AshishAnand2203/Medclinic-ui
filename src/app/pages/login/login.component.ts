import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { TokenStorageService } from '../../services/token-storage.service';


@Component({
  standalone: false,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent {


    form = {

        email: '',

        password: '',

        remember: false

    };


    isLoading: boolean = false;

    showPassword: boolean = false;

    errorMessage: string = '';


    constructor(
        private router: Router,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService
    ) {}


    // =========================================================
    // PASSWORD
    // =========================================================

    togglePassword(): void {

        this.showPassword = !this.showPassword;

    }


    // =========================================================
    // LOGIN
    // =========================================================

    login(): void {

        if (this.isLoading) {
            return;
        }


        this.errorMessage = '';

        this.isLoading = true;


        const data = {

            email: this.form.email.trim(),

            password: this.form.password

        };


        this.apiService
            .post('admin/login', data)
            .subscribe({

                next: (response: any) => {

                    this.isLoading = false;


                    if (!response.status) {

                        this.errorMessage =
                            response.message ||
                            'Unable to login.';

                        return;
                    }


                    this.tokenStorage.saveLogin(
                        response.token,
                        response.user,
                        this.form.remember
                    );


                    this.router.navigate([
                        '/dashboard'
                    ]);

                },


                error: (error: any) => {

                    this.isLoading = false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to login. Please try again.';

                }

            });

    }

}
