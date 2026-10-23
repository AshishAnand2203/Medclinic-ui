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
    selector: 'app-doctor-list',
    templateUrl: './doctor-list.component.html',
    styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {

    // =========================================================
    // DATA
    // =========================================================

    doctors: any[] = [];

    categories: any[] = [];


    // =========================================================
    // FILTER
    // =========================================================

    search: string = '';

    status: string = '';

    categoryId: string = '';


    // =========================================================
    // PAGINATION
    // =========================================================

    page: number = 1;

    limit: number = 20;

    total: number = 0;

    totalPages: number = 0;


    // =========================================================
    // STATE
    // =========================================================

    isLoading: boolean = false;

    successMessage: string = '';

    errorMessage: string = '';


    // =========================================================
    // DELETE
    // =========================================================

    selectedDoctor: any = null;

    showDeleteModal: boolean = false;

    isDeleting: boolean = false;

    deleteError: string = '';


    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    ngOnInit(): void {

        this.loadCategories();

        this.loadDoctors();

    }


    // =========================================================
    // LOAD CATEGORIES
    // =========================================================

    loadCategories(): void {

        this.apiService
            .get(
                'admin/doctors/categories'
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    if (
                        response?.status
                    ) {

                        this.categories =
                            response.data || [];

                    }

                },

                error: () => {

                    this.categories = [];

                }

            });

    }


    // =========================================================
    // LOAD DOCTORS
    // =========================================================

    loadDoctors(): void {

        this.isLoading = true;

        this.errorMessage = '';


        const params = {

            search:
                this.search,

            status:
                this.status,

            category_id:
                this.categoryId,

            page:
                this.page,

            limit:
                this.limit

        };


        this.apiService
            .get(
                'admin/doctors',
                params
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isLoading = false;


                    if (
                        !response?.status
                    ) {

                        this.errorMessage =
                            'Unable to load doctors.';

                        return;

                    }


                    this.doctors =
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

                },


                error: (
                    error: any
                ) => {

                    this.isLoading = false;


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to load doctors.';

                }

            });

    }


    // =========================================================
    // FILTER
    // =========================================================

    applyFilters(): void {

        this.page = 1;

        this.loadDoctors();

    }


    clearFilters(): void {

        this.search = '';

        this.status = '';

        this.categoryId = '';

        this.page = 1;

        this.loadDoctors();

    }


    // =========================================================
    // PER PAGE
    // =========================================================

    changeLimit(): void {

        this.page = 1;

        this.loadDoctors();

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

        this.loadDoctors();

    }


    nextPage(): void {

        if (
            this.page >=
            this.totalPages
        ) {
            return;
        }


        this.page++;

        this.loadDoctors();

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


        this.page = page;

        this.loadDoctors();

    }


    get pages(): number[] {

        const pages: number[] = [];

        const start =
            Math.max(
                1,
                this.page - 2
            );

        const end =
            Math.min(
                this.totalPages,
                this.page + 2
            );


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
    // EDIT
    // =========================================================

    editDoctor(
        doctor: any
    ): void {

        this.router.navigate([
            '/doctor/edit',
            doctor.id
        ]);

    }


    // =========================================================
    // STATUS
    // =========================================================

    changeStatus(
        doctor: any
    ): void {

        const newStatus =
            Number(doctor.status) === 1
                ? 0
                : 1;


        this.apiService
            .patch(
                `admin/doctors/${doctor.id}/status`,
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

                        doctor.status =
                            newStatus;

                        this.successMessage =
                            response.message;

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

                        'Unable to update status.';

                }

            });

    }


    // =========================================================
    // DELETE MODAL
    // =========================================================

    openDeleteModal(
        doctor: any
    ): void {

        this.selectedDoctor =
            doctor;

        this.deleteError = '';

        this.showDeleteModal =
            true;


        document.body
            .classList
            .add(
                'modal-open'
            );

    }


    closeDeleteModal(): void {

        if (
            this.isDeleting
        ) {
            return;
        }


        this.showDeleteModal =
            false;

        this.selectedDoctor =
            null;

        this.deleteError =
            '';


        document.body
            .classList
            .remove(
                'modal-open'
            );

    }


    // =========================================================
    // DELETE
    // =========================================================

    deleteDoctor(): void {

        if (
            !this.selectedDoctor?.id ||
            this.isDeleting
        ) {
            return;
        }


        this.isDeleting =
            true;

        this.deleteError =
            '';


        this.apiService
            .delete(
                `admin/doctors/${this.selectedDoctor.id}`
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isDeleting =
                        false;


                    if (
                        !response?.status
                    ) {

                        this.deleteError =
                            response?.message ||
                            'Unable to delete doctor.';

                        return;

                    }


                    this.successMessage =
                        response.message;


                    this.showDeleteModal =
                        false;

                    this.selectedDoctor =
                        null;


                    document.body
                        .classList
                        .remove(
                            'modal-open'
                        );


                    this.loadDoctors();

                },


                error: (
                    error: any
                ) => {

                    this.isDeleting =
                        false;


                    this.deleteError =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to delete doctor.';

                }

            });

    }

}
