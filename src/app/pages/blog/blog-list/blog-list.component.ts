import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  standalone: false,
    selector: 'app-blog-list',
    templateUrl: './blog-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

    // =========================================================
    // DATA
    // =========================================================

    blogs: any[] = [];
    filteredBlogs: any[] = [];
    paginatedBlogs: any[] = [];


    // =========================================================
    // FILTER
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

    selectedBlog: any = null;


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

        this.loadBlogs();
    }


    // =========================================================
    // LOAD BLOGS
    // =========================================================

    loadBlogs(): void {

        this.isLoading = true;

        this.errorMessage = '';


        this.apiService
            .get('admin/blogs')
            .subscribe({

                next: (response: any) => {

                    this.isLoading = false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to load blogs.';

                        return;
                    }


                    const data =
                        Array.isArray(response?.data)
                            ? response.data
                            : [];


                    // =========================================
                    // NORMALIZE DATABASE VALUES
                    // =========================================

                    this.blogs =
                        data.map((item: any) => ({

                            ...item,

                            id:
                                Number(item.id),

                            status:
                                Number(item.status),

                            sort_order:
                                Number(
                                    item.sort_order || 0
                                )
                        }));


                    this.applyFilters();
                },


                error: (error: any) => {

                    console.error(
                        'Load blogs error:',
                        error
                    );


                    this.isLoading = false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load blogs.';
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


        this.filteredBlogs =
            this.blogs.filter(
                (blog: any) => {

                    // =========================================
                    // SEARCH
                    // =========================================

                    const matchesSearch =
                        !search ||
                        String(
                            blog.title || ''
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            blog.slug || ''
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            blog.author || ''
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            blog.short_description || ''
                        )
                            .toLowerCase()
                            .includes(search);


                    // =========================================
                    // STATUS
                    // =========================================

                    const matchesStatus =
                        this.statusFilter === '' ||
                        String(blog.status) ===
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
    // CHANGE PAGE SIZE
    // =========================================================

    changePageSize(): void {

        this.currentPage = 1;

        this.updatePagination();
    }


    // =========================================================
    // UPDATE PAGINATION
    // =========================================================

    updatePagination(): void {

        const totalItems =
            this.filteredBlogs.length;


        this.totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalItems /
                    this.pageSize
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
            ) * this.pageSize;


        const end =
            start +
            this.pageSize;


        this.paginatedBlogs =
            this.filteredBlogs.slice(
                start,
                end
            );
    }


    // =========================================================
    // PREVIOUS PAGE
    // =========================================================

    previousPage(): void {

        if (
            this.currentPage > 1
        ) {

            this.currentPage--;

            this.updatePagination();
        }
    }


    // =========================================================
    // NEXT PAGE
    // =========================================================

    nextPage(): void {

        if (
            this.currentPage <
            this.totalPages
        ) {

            this.currentPage++;

            this.updatePagination();
        }
    }


    // =========================================================
    // GO TO PAGE
    // =========================================================

    goToPage(
        page: number
    ): void {

        if (
            page < 1 ||
            page > this.totalPages
        ) {
            return;
        }


        this.currentPage =
            page;


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
                start +
                maxVisible -
                1
            );


        if (
            end - start + 1 <
            maxVisible
        ) {

            start =
                Math.max(
                    1,
                    end -
                    maxVisible +
                    1
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
            this.filteredBlogs.length === 0
        ) {
            return 0;
        }


        return (
            (
                this.currentPage - 1
            ) *
            this.pageSize
        ) + 1;
    }


    // =========================================================
    // RESULT END
    // =========================================================

    get resultEnd(): number {

        return Math.min(

            this.currentPage *
            this.pageSize,

            this.filteredBlogs.length
        );
    }


    // =========================================================
    // ADD
    // =========================================================

    addBlog(): void {

        this.router.navigate([
            '/blog/add'
        ]);
    }


    // =========================================================
    // EDIT
    // =========================================================

    editBlog(
        blog: any
    ): void {

        this.router.navigate([
            '/blog/edit',
            blog.id
        ]);
    }


    // =========================================================
    // CHANGE STATUS
    // =========================================================

    changeStatus(
        blog: any
    ): void {

        if (
            this.updatingStatusId !== null
        ) {
            return;
        }


        const newStatus =
            Number(blog.status) === 1
                ? 0
                : 1;


        this.updatingStatusId =
            Number(blog.id);


        this.successMessage = '';

        this.errorMessage = '';


        this.apiService
            .patch(
                `admin/blogs/${blog.id}/status`,
                {
                    status: newStatus
                }
            )
            .subscribe({

                next: (response: any) => {

                    this.updatingStatusId =
                        null;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to update blog status.';

                        return;
                    }


                    blog.status =
                        newStatus;


                    this.successMessage =
                        response?.message ||
                        'Blog status updated successfully.';


                    this.applyFilters();

                    this.clearSuccessMessage();
                },


                error: (error: any) => {

                    console.error(
                        'Blog status error:',
                        error
                    );


                    this.updatingStatusId =
                        null;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to update blog status.';
                }

            });
    }


    // =========================================================
    // OPEN DELETE MODAL
    // =========================================================

    confirmDelete(
        blog: any
    ): void {

        this.selectedBlog =
            blog;


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


        this.selectedBlog =
            null;


        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // DELETE BLOG
    // =========================================================

    deleteBlog(): void {

        if (
            !this.selectedBlog ||
            this.deletingId !== null
        ) {
            return;
        }


        const id =
            Number(
                this.selectedBlog.id
            );


        this.deletingId =
            id;


        this.successMessage = '';

        this.errorMessage = '';


        this.apiService
            .delete(
                `admin/blogs/${id}`
            )
            .subscribe({

                next: (response: any) => {

                    this.deletingId =
                        null;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to delete blog.';

                        return;
                    }


                    this.blogs =
                        this.blogs.filter(
                            (blog: any) =>
                                Number(blog.id) !==
                                id
                        );


                    this.showDeleteModal =
                        false;


                    this.selectedBlog =
                        null;


                    document.body.classList.remove(
                        'modal-open'
                    );


                    this.successMessage =
                        response?.message ||
                        'Blog deleted successfully.';


                    this.applyFilters();

                    this.clearSuccessMessage();
                },


                error: (error: any) => {

                    console.error(
                        'Delete blog error:',
                        error
                    );


                    this.deletingId =
                        null;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to delete blog.';
                }

            });
    }


    // =========================================================
    // FORMAT DATE
    // =========================================================

    formatDate(
        date: string
    ): string {

        if (!date) {
            return 'Not Published';
        }


        const parts =
            date.split('-');


        if (
            parts.length !== 3
        ) {
            return date;
        }


        const parsed =
            new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );


        return parsed.toLocaleDateString(
            'en-AU',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    }


    // =========================================================
    // CLEAR SUCCESS
    // =========================================================

    private clearSuccessMessage(): void {

        setTimeout(() => {

            this.successMessage = '';

        }, 3000);
    }
}
