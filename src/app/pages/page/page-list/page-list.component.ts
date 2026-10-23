import {
    Component,
    OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import { ApiService }
    from '../../../services/api.service';


@Component({
  standalone: false,
    selector: 'app-page-list',
    templateUrl: './page-list.component.html',
    styleUrls: ['./page-list.component.css']
})
export class PageListComponent implements OnInit {

    // =========================================================
    // DATA
    // =========================================================

    pages: any[] = [];


    // =========================================================
    // LOADING
    // =========================================================

    isLoading: boolean = false;


    // =========================================================
    // FILTER
    // =========================================================

    search: string = '';

    status: string = '';


    // =========================================================
    // PAGINATION
    // =========================================================

    currentPage: number = 1;

    perPage: number = 10;

    total: number = 0;

    lastPage: number = 1;


    // =========================================================
    // ACTION
    // =========================================================

    deletingId: number | null = null;

    statusUpdatingId: number | null = null;


    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    // =========================================================
    // INIT
    // =========================================================

    ngOnInit(): void {

        this.loadPages();

    }


    // =========================================================
    // LOAD PAGES
    // =========================================================

    loadPages(): void {

        this.isLoading = true;


        const params = {

            search: this.search,

            status: this.status,

            page: this.currentPage,

            limit: this.perPage

        };


        this.apiService
            .get(
                'admin/pages',
                params
            )
            .subscribe({

                next: (response: any) => {

                    this.isLoading = false;


                    if (response?.status) {

                        this.pages =
                            response.data || [];


                        this.currentPage =
                            response.pagination
                                ?.current_page || 1;


                        this.perPage =
                            response.pagination
                                ?.per_page || 10;


                        this.total =
                            response.pagination
                                ?.total || 0;


                        this.lastPage =
                            response.pagination
                                ?.last_page || 1;

                    }

                },


                error: (error: any) => {

                    this.isLoading = false;

                    this.pages = [];


                    console.error(
                        'Page load error:',
                        error
                    );

                }

            });

    }


    // =========================================================
    // SEARCH
    // =========================================================

    onSearch(): void {

        this.currentPage = 1;

        this.loadPages();

    }


    // =========================================================
    // STATUS FILTER
    // =========================================================

    onStatusChange(): void {

        this.currentPage = 1;

        this.loadPages();

    }


    // =========================================================
    // RESET FILTERS
    // =========================================================

    resetFilters(): void {

        this.search = '';

        this.status = '';

        this.currentPage = 1;

        this.loadPages();

    }


    // =========================================================
    // PER PAGE
    // =========================================================

    changePerPage(): void {

        this.currentPage = 1;

        this.loadPages();

    }


    // =========================================================
    // PREVIOUS
    // =========================================================

    previousPage(): void {

        if (this.currentPage <= 1) {

            return;

        }


        this.currentPage--;

        this.loadPages();

    }


    // =========================================================
    // NEXT
    // =========================================================

    nextPage(): void {

        if (
            this.currentPage >=
            this.lastPage
        ) {

            return;

        }


        this.currentPage++;

        this.loadPages();

    }


    // =========================================================
    // GO TO PAGE
    // =========================================================

    goToPage(page: number): void {

        if (
            page < 1 ||
            page > this.lastPage ||
            page === this.currentPage
        ) {

            return;

        }


        this.currentPage = page;

        this.loadPages();

    }


    // =========================================================
    // PAGE NUMBERS
    // =========================================================

    get pageNumbers(): number[] {

        const pages: number[] = [];


        const start = Math.max(
            1,
            this.currentPage - 2
        );


        const end = Math.min(
            this.lastPage,
            this.currentPage + 2
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

    editPage(id: number): void {

        this.router.navigate([
            '/page/edit',
            id
        ]);

    }


    // =========================================================
    // CHANGE STATUS
    // =========================================================

    toggleStatus(page: any): void {

        if (
            this.statusUpdatingId !== null
        ) {

            return;

        }


        this.statusUpdatingId =
            page.id;


        this.apiService
            .patch(
                `admin/pages/${page.id}/status`,
                {}
            )
            .subscribe({

                next: (response: any) => {

                    this.statusUpdatingId =
                        null;


                    if (response?.status) {

                        page.status =
                            response.page_status;

                    }

                },


                error: (error: any) => {

                    this.statusUpdatingId =
                        null;


                    console.error(
                        'Status update error:',
                        error
                    );

                }

            });

    }


    // =========================================================
    // DELETE
    // =========================================================

    deletePage(page: any): void {

        const confirmed =
            confirm(
                `Are you sure you want to delete "${page.title}"?`
            );


        if (!confirmed) {

            return;

        }


        this.deletingId =
            page.id;


        this.apiService
            .delete(
                `admin/pages/${page.id}`
            )
            .subscribe({

                next: (response: any) => {

                    this.deletingId =
                        null;


                    if (response?.status) {

                        // If last item on current page
                        // move to previous page.

                        if (
                            this.pages.length === 1 &&
                            this.currentPage > 1
                        ) {

                            this.currentPage--;

                        }


                        this.loadPages();

                    }

                },


                error: (error: any) => {

                    this.deletingId =
                        null;


                    console.error(
                        'Delete page error:',
                        error
                    );

                }

            });

    }


    // =========================================================
    // SERIAL NUMBER
    // =========================================================

    getSerial(index: number): number {

        return (
            (
                this.currentPage - 1
            ) *
            this.perPage
        ) + index + 1;

    }

}
