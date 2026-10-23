import {
    Component,
    OnInit
} from '@angular/core';

import {
    Router
} from '@angular/router';

import {
    ApiService
} from '../../../services/api.service';


@Component({
  standalone: false,
    selector: 'app-service-list',
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {

    services: any[] = [];
    parentServices: any[] = [];

    isLoading: boolean = false;

    search: string = '';
    status: string = '';
    parent: string = '';

    page: number = 1;
    limit: number = 20;

    total: number = 0;
    totalPages: number = 0;

    successMessage: string = '';
    errorMessage: string = '';

    deleteServiceData: any = null;


    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    ngOnInit(): void {

        this.loadParents();

        this.loadServices();

    }


    // =========================================================
    // LOAD SERVICES
    // =========================================================

    loadServices(): void {

        this.isLoading = true;

        this.errorMessage = '';


        const params: any = {

            search:
                this.search,

            status:
                this.status,

            parent:
                this.parent,

            page:
                this.page,

            limit:
                this.limit

        };


        this.apiService
            .get(
                'admin/services',
                params
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isLoading =
                        false;


                    if (
                        response?.status
                    ) {

                        this.services =
                            response.data || [];


                        this.total =
                            Number(
                                response
                                    ?.pagination
                                    ?.total || 0
                            );


                        this.totalPages =
                            Number(
                                response
                                    ?.pagination
                                    ?.total_pages || 0
                            );

                    }

                },


                error: (
                    error: any
                ) => {

                    this.isLoading =
                        false;


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to load services.';

                }

            });

    }


    // =========================================================
    // LOAD PARENT SERVICES
    // =========================================================

    loadParents(): void {

        this.apiService
            .get(
                'admin/services/parents'
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    if (
                        response?.status
                    ) {

                        this.parentServices =
                            response.data || [];

                    }

                }

            });

    }


    // =========================================================
    // SEARCH
    // =========================================================

    onSearch(): void {

        this.page = 1;

        this.loadServices();

    }


    // =========================================================
    // FILTER
    // =========================================================

    onFilterChange(): void {

        this.page = 1;

        this.loadServices();

    }


    // =========================================================
    // LIMIT
    // =========================================================

    onLimitChange(): void {

        this.page = 1;

        this.loadServices();

    }


    // =========================================================
    // RESET
    // =========================================================

    resetFilters(): void {

        this.search = '';

        this.status = '';

        this.parent = '';

        this.page = 1;

        this.loadServices();

    }


    // =========================================================
    // EDIT
    // =========================================================

    editService(
        service: any
    ): void {

        this.router.navigate([
            '/service/edit',
            service.id
        ]);

    }


    // =========================================================
    // STATUS
    // =========================================================

    changeStatus(
        service: any
    ): void {

        const newStatus =
            Number(
                service.status
            ) === 1
                ? 0
                : 1;


        this.apiService
            .patch(
                `admin/services/${service.id}/status`,
                {
                    status:
                        newStatus
                }
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    if (
                        response?.status
                    ) {

                        service.status =
                            newStatus;


                        this.successMessage =
                            response.message ||
                            'Service status updated.';


                        setTimeout(
                            () => {

                                this.successMessage =
                                    '';

                            },
                            2500
                        );

                    }

                },


                error: (
                    error: any
                ) => {

                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to update service status.';

                }

            });

    }


    // =========================================================
    // DELETE
    // =========================================================

    confirmDelete(
        service: any
    ): void {

        this.deleteServiceData =
            service;

    }


    cancelDelete(): void {

        this.deleteServiceData =
            null;

    }


    deleteService(): void {

        if (
            !this.deleteServiceData
        ) {

            return;

        }


        const id =
            this.deleteServiceData.id;


        this.apiService
            .delete(
                `admin/services/${id}`
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.deleteServiceData =
                        null;


                    if (
                        response?.status
                    ) {

                        this.successMessage =
                            response.message ||
                            'Service deleted successfully.';


                        this.loadServices();

                    }

                },


                error: (
                    error: any
                ) => {

                    this.deleteServiceData =
                        null;


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to delete service.';

                }

            });

    }


    // =========================================================
    // PAGINATION
    // =========================================================

    previousPage(): void {

        if (
            this.page <= 1
        ) {

            return;

        }


        this.page--;

        this.loadServices();

    }


    nextPage(): void {

        if (
            this.page >=
            this.totalPages
        ) {

            return;

        }


        this.page++;

        this.loadServices();

    }


    goToPage(
        page: number
    ): void {

        if (
            page < 1 ||
            page > this.totalPages ||
            page === this.page
        ) {

            return;

        }


        this.page =
            page;


        this.loadServices();

    }


    // =========================================================
    // PAGE NUMBERS
    // =========================================================

    get pageNumbers(): number[] {

        const pages: number[] =
            [];


        if (
            this.totalPages <= 0
        ) {

            return pages;

        }


        let start =
            Math.max(
                1,
                this.page - 2
            );


        let end =
            Math.min(
                this.totalPages,
                start + 4
            );


        if (
            end - start < 4
        ) {

            start =
                Math.max(
                    1,
                    end - 4
                );

        }


        for (
            let i = start;
            i <= end;
            i++
        ) {

            pages.push(i);

        }


        return pages;

    }


    // =========================================================
    // ROW NUMBER
    // =========================================================

    getRowNumber(
        index: number
    ): number {

        return (
            (this.page - 1) *
            this.limit
        ) + index + 1;

    }


    // =========================================================
    // IMAGE
    // =========================================================

    getServiceImage(
        service: any
    ): string {

        if (
            service?.image
        ) {

            return service.image;

        }


        return 'assets/images/no-image.png';

    }

}
