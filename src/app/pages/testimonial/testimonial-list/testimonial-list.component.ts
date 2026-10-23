import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  standalone: false,
    selector: 'app-testimonial-list',
    templateUrl: './testimonial-list.component.html',
    styleUrls: ['./testimonial-list.component.css']
})
export class TestimonialListComponent implements OnInit {

    // =========================================================
    // DATA
    // =========================================================

    testimonials: any[] = [];
    filteredTestimonials: any[] = [];
    paginatedTestimonials: any[] = [];


    // =========================================================
    // FILTERS
    // =========================================================

    searchText: string = '';
    statusFilter: string = '';


    // =========================================================
    // PAGINATION
    // =========================================================

    pageSize: number = 10;
    currentPage: number = 1;
    totalPages: number = 1;


    // =========================================================
    // STATES
    // =========================================================

    isLoading: boolean = false;
    deletingId: number | null = null;
    updatingStatusId: number | null = null;

    successMessage: string = '';
    errorMessage: string = '';


    // =========================================================
    // DELETE MODAL
    // =========================================================

    showDeleteModal: boolean = false;
    selectedTestimonial: any = null;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    // =========================================================
    // INIT
    // =========================================================

    ngOnInit(): void {
        this.loadTestimonials();
    }


    // =========================================================
    // LOAD TESTIMONIALS
    // =========================================================

    loadTestimonials(): void {

        this.isLoading = true;
        this.errorMessage = '';

        this.apiService
            .get('admin/testimonials')
            .subscribe({

                next: (response: any) => {

                    this.isLoading = false;

                    if (response?.status !== 'success') {

                        this.testimonials = [];
                        this.applyFilters();

                        this.errorMessage =
                            response?.message ||
                            'Unable to load testimonials.';

                        return;
                    }

                    this.testimonials =
                        Array.isArray(response?.data)
                            ? response.data
                            : [];

                    this.applyFilters();
                },

                error: (error: any) => {

                    console.error(
                        'Load testimonials error:',
                        error
                    );

                    this.isLoading = false;

                    this.testimonials = [];

                    this.applyFilters();

                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load testimonials.';
                }

            });
    }


    // =========================================================
    // APPLY FILTERS
    // =========================================================

    applyFilters(): void {

        const search =
            this.searchText
                .trim()
                .toLowerCase();

        this.filteredTestimonials =
            this.testimonials.filter(
                (item: any) => {

                    // =========================================
                    // SEARCH
                    // =========================================

                    const name =
                        String(
                            item?.name || ''
                        ).toLowerCase();

                    const designation =
                        String(
                            item?.designation || ''
                        ).toLowerCase();

                    const testimonial =
                        String(
                            item?.testimonial || ''
                        ).toLowerCase();


                    const matchesSearch =
                        !search ||
                        name.includes(search) ||
                        designation.includes(search) ||
                        testimonial.includes(search);


                    // =========================================
                    // STATUS
                    // =========================================

                    const matchesStatus =
                        this.statusFilter === '' ||
                        String(item?.status) ===
                        this.statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        this.currentPage = 1;

        this.updatePagination();
    }


    // =========================================================
    // RESET FILTER
    // =========================================================

    resetFilters(): void {

        this.searchText = '';
        this.statusFilter = '';

        this.applyFilters();
    }


    // =========================================================
    // PAGE SIZE
    // =========================================================

    changePageSize(): void {

        this.currentPage = 1;

        this.updatePagination();
    }


    // =========================================================
    // UPDATE PAGINATION
    // =========================================================

    updatePagination(): void {

        const pageSize =
            Number(this.pageSize) || 10;


        this.totalPages =
            Math.max(
                1,
                Math.ceil(
                    this.filteredTestimonials.length /
                    pageSize
                )
            );


        if (
            this.currentPage >
            this.totalPages
        ) {

            this.currentPage =
                this.totalPages;
        }


        const start =
            (
                this.currentPage - 1
            ) * pageSize;


        const end =
            start + pageSize;


        this.paginatedTestimonials =
            this.filteredTestimonials.slice(
                start,
                end
            );
    }


    // =========================================================
    // PREVIOUS PAGE
    // =========================================================

    previousPage(): void {

        if (
            this.currentPage <= 1
        ) {
            return;
        }

        this.currentPage--;

        this.updatePagination();
    }


    // =========================================================
    // NEXT PAGE
    // =========================================================

    nextPage(): void {

        if (
            this.currentPage >=
            this.totalPages
        ) {
            return;
        }

        this.currentPage++;

        this.updatePagination();
    }


    // =========================================================
    // GO TO PAGE
    // =========================================================

    goToPage(page: number): void {

        if (
            page < 1 ||
            page > this.totalPages
        ) {
            return;
        }

        this.currentPage = page;

        this.updatePagination();
    }


    // =========================================================
    // PAGE NUMBERS
    // =========================================================

    getPageNumbers(): number[] {

        const pages: number[] = [];

        const maxVisible = 5;

        let start =
            Math.max(
                1,
                this.currentPage - 2
            );

        let end =
            Math.min(
                this.totalPages,
                start + maxVisible - 1
            );


        if (
            end - start <
            maxVisible - 1
        ) {

            start =
                Math.max(
                    1,
                    end - maxVisible + 1
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
    // RESULT START
    // =========================================================

    get resultStart(): number {

        if (
            this.filteredTestimonials.length === 0
        ) {
            return 0;
        }

        return (
            (
                this.currentPage - 1
            ) * Number(this.pageSize)
        ) + 1;
    }


    // =========================================================
    // RESULT END
    // =========================================================

    get resultEnd(): number {

        return Math.min(
            this.currentPage *
            Number(this.pageSize),

            this.filteredTestimonials.length
        );
    }


    // =========================================================
    // ADD
    // =========================================================

    addTestimonial(): void {

        this.router.navigate([
            '/testimonial/add'
        ]);
    }


    // =========================================================
    // EDIT
    // =========================================================

    editTestimonial(
        testimonial: any
    ): void {

        if (!testimonial?.id) {
            return;
        }

        this.router.navigate([
            '/testimonial/edit',
            testimonial.id
        ]);
    }


    // =========================================================
    // STATUS CHANGE
    // =========================================================

    changeStatus(
        testimonial: any
    ): void {

        if (
            !testimonial?.id ||
            this.updatingStatusId !== null
        ) {
            return;
        }


        const oldStatus =
            Number(
                testimonial.status
            );


        const newStatus =
            oldStatus === 1
                ? 0
                : 1;


        this.updatingStatusId =
            Number(
                testimonial.id
            );


        this.successMessage = '';
        this.errorMessage = '';


        this.apiService
            .patch(
                `admin/testimonials/${testimonial.id}/status`,
                {
                    status: newStatus
                }
            )
            .subscribe({

                next: (response: any) => {

                    this.updatingStatusId = null;

                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to update testimonial status.';

                        return;
                    }


                    testimonial.status =
                        newStatus;


                    const original =
                        this.testimonials.find(
                            (item: any) =>
                                Number(item.id) ===
                                Number(testimonial.id)
                        );


                    if (original) {

                        original.status =
                            newStatus;
                    }


                    this.successMessage =
                        response?.message ||
                        'Testimonial status updated successfully.';


                    this.applyFilters();


                    this.clearMessages();
                },

                error: (error: any) => {

                    console.error(
                        'Testimonial status error:',
                        error
                    );

                    this.updatingStatusId = null;

                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to update testimonial status.';
                }

            });
    }


    // =========================================================
    // OPEN DELETE MODAL
    // =========================================================

    confirmDelete(
        testimonial: any
    ): void {

        this.selectedTestimonial =
            testimonial;

        this.showDeleteModal =
            true;

        document.body.classList.add(
            'modal-open'
        );
    }


    // =========================================================
    // CLOSE DELETE MODAL
    // =========================================================

    closeDeleteModal(): void {

        if (
            this.deletingId !== null
        ) {
            return;
        }

        this.showDeleteModal =
            false;

        this.selectedTestimonial =
            null;

        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    deleteTestimonial(): void {

        if (
            !this.selectedTestimonial?.id ||
            this.deletingId !== null
        ) {
            return;
        }


        const id =
            Number(
                this.selectedTestimonial.id
            );


        this.deletingId = id;

        this.successMessage = '';
        this.errorMessage = '';


        this.apiService
            .delete(
                `admin/testimonials/${id}`
            )
            .subscribe({

                next: (response: any) => {

                    this.deletingId = null;

                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to delete testimonial.';

                        return;
                    }


                    this.testimonials =
                        this.testimonials.filter(
                            (item: any) =>
                                Number(item.id) !== id
                        );


                    this.showDeleteModal =
                        false;

                    this.selectedTestimonial =
                        null;

                    document.body.classList.remove(
                        'modal-open'
                    );


                    this.applyFilters();


                    this.successMessage =
                        response?.message ||
                        'Testimonial deleted successfully.';


                    this.clearMessages();
                },

                error: (error: any) => {

                    console.error(
                        'Delete testimonial error:',
                        error
                    );

                    this.deletingId = null;

                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to delete testimonial.';
                }

            });
    }


    // =========================================================
    // STAR ARRAY
    // =========================================================

    getStars(
        rating: any
    ): number[] {

        const value =
            Math.max(
                0,
                Math.min(
                    5,
                    Number(rating) || 0
                )
            );


        return [
            1,
            2,
            3,
            4,
            5
        ].map(
            (star) =>
                star <= value
                    ? 1
                    : 0
        );
    }


    // =========================================================
    // CLEAR MESSAGES
    // =========================================================

    private clearMessages(): void {

        setTimeout(() => {

            this.successMessage = '';

        }, 3000);
    }

}
