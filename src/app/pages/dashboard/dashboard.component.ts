import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { ApiService } from '../../services/api.service';
import { TokenStorageService } from '../../services/token-storage.service';


@Component({
  standalone: false,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    user: any;

    isLoading = false;


    stats = {
        pages: 0,
        services: 0,
        doctors: 0,
        enquiries: 0
    };


    recentEnquiries: any[] = [];


    constructor(
        private apiService: ApiService,
        private tokenStorage: TokenStorageService
    ) {}


    ngOnInit(): void {

        this.user = this.tokenStorage.getUser();

        this.loadDashboard();

    }


    loadDashboard(): void {

        this.isLoading = true;


        this.apiService
            .get('admin/dashboard')
            .subscribe({

                next: (response: any) => {

                    this.isLoading = false;


                    if (response?.status) {

                        this.stats = response.stats;

                        this.recentEnquiries =
                            response.recent_enquiries || [];

                    }

                },


                error: () => {

                    this.isLoading = false;

                }

            });

    }

}
