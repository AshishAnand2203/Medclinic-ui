import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  ApiService
} from 'src/app/services/api.service';


@Component({
  standalone: false,
  selector: 'app-slider-list',
  templateUrl: './slider-list.component.html',
  styleUrls: ['./slider-list.component.css']
})
export class SliderListComponent
  implements OnInit {


  // =========================================================
  // DATA
  // =========================================================

  sliders: any[] = [];

  filteredSliders: any[] = [];

  paginatedSliders: any[] = [];


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
  // STATE
  // =========================================================

  isLoading: boolean = false;

  deletingId: number | null = null;

  statusUpdatingId: number | null = null;

  successMessage: string = '';

  errorMessage: string = '';


  // =========================================================
  // DELETE MODAL
  // =========================================================

  showDeleteModal: boolean = false;

  deleteSliderData: any = null;


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

    this.loadSliders();

  }


  // =========================================================
  // LOAD
  // =========================================================

  loadSliders(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.apiService
      .get('admin/sliders')
      .subscribe({

        next: (response: any) => {

          this.isLoading = false;


          if (
            !response ||
            response.status !== 'success'
          ) {

            this.sliders = [];

            this.errorMessage =
              response?.message ||
              'Unable to load sliders.';

            this.applyFilters();

            return;

          }


          this.sliders =
            Array.isArray(response.data)
              ? response.data
              : [];


          // ===============================================
          // SORT
          // ===============================================

          this.sliders.sort(
            (a: any, b: any) => {

              return (
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
              );

            }
          );


          this.applyFilters();

        },


        error: (error: any) => {

          this.isLoading = false;

          this.sliders = [];

          this.applyFilters();


          this.errorMessage =
            error?.error?.message ||
            'Unable to load sliders.';

        }

      });

  }


  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredSliders =
      this.sliders.filter(
        (slider: any) => {


          // =============================================
          // SEARCH
          // =============================================

          let searchMatch = true;


          if (search) {

            searchMatch = [

              slider.title,

              slider.subtitle,

              slider.button_text,

              slider.button_link

            ]
              .filter(Boolean)
              .some(
                (value: any) =>

                  String(value)
                    .toLowerCase()
                    .includes(search)

              );

          }


          // =============================================
          // STATUS
          // =============================================

          let statusMatch = true;


          if (
            this.statusFilter !== ''
          ) {

            statusMatch =

              Number(slider.status) ===
              Number(this.statusFilter);

          }


          return (
            searchMatch &&
            statusMatch
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
  // PAGINATION
  // =========================================================

  updatePagination(): void {

    this.totalPages =
      Math.max(
        1,
        Math.ceil(
          this.filteredSliders.length /
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


    this.paginatedSliders =
      this.filteredSliders.slice(
        start,
        start + this.pageSize
      );

  }


  // =========================================================
  // GO PAGE
  // =========================================================

  goToPage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {

      return;

    }


    this.currentPage =
      page;

    this.updatePagination();

  }


  // =========================================================
  // VISIBLE PAGES
  // =========================================================

  get visiblePages(): number[] {

    const pages: number[] = [];

    const start =
      Math.max(
        1,
        this.currentPage - 2
      );

    const end =
      Math.min(
        this.totalPages,
        start + 4
      );


    for (
      let i = Math.max(1, end - 4);
      i <= end;
      i++
    ) {

      pages.push(i);

    }


    return pages;

  }


  // =========================================================
  // START RECORD
  // =========================================================

  get startRecord(): number {

    if (
      this.filteredSliders.length === 0
    ) {

      return 0;

    }


    return (
      (
        this.currentPage - 1
      ) * this.pageSize
    ) + 1;

  }


  // =========================================================
  // END RECORD
  // =========================================================

  get endRecord(): number {

    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredSliders.length

    );

  }


  // =========================================================
  // ADD
  // =========================================================

  addSlider(): void {

    this.router.navigate([
      '/slider/add'
    ]);

  }


  // =========================================================
  // EDIT
  // =========================================================

  editSlider(
    slider: any
  ): void {

    this.router.navigate([
      '/slider/edit',
      slider.id
    ]);

  }


  // =========================================================
  // STATUS
  // =========================================================

  changeStatus(
    slider: any
  ): void {

    if (
      this.statusUpdatingId !== null
    ) {

      return;

    }


    const oldStatus =
      Number(slider.status);

    const newStatus =
      oldStatus === 1
        ? 0
        : 1;


    this.statusUpdatingId =
      Number(slider.id);

    this.successMessage = '';

    this.errorMessage = '';


    this.apiService
      .patch(
        `admin/sliders/${slider.id}/status`,
        {
          status: newStatus
        }
      )
      .subscribe({

        next: (response: any) => {

          this.statusUpdatingId =
            null;


          if (
            response?.status !== 'success'
          ) {

            this.errorMessage =
              response?.message ||
              'Unable to update status.';

            return;

          }


          slider.status =
            newStatus;


          this.successMessage =
            response?.message ||
            'Slider status updated successfully.';


          this.applyFilters();

        },


        error: (error: any) => {

          this.statusUpdatingId =
            null;


          this.errorMessage =
            error?.error?.message ||
            'Unable to update slider status.';

        }

      });

  }


  // =========================================================
  // DELETE MODAL
  // =========================================================

  openDeleteModal(
    slider: any
  ): void {

    this.deleteSliderData =
      slider;

    this.showDeleteModal =
      true;

  }


  closeDeleteModal(): void {

    if (
      this.deletingId !== null
    ) {

      return;

    }


    this.showDeleteModal =
      false;

    this.deleteSliderData =
      null;

  }


  // =========================================================
  // DELETE
  // =========================================================

  confirmDelete(): void {

    if (
      !this.deleteSliderData
    ) {

      return;

    }


    const slider =
      this.deleteSliderData;


    this.deletingId =
      Number(slider.id);

    this.successMessage = '';

    this.errorMessage = '';


    this.apiService
      .delete(
        `admin/sliders/${slider.id}`
      )
      .subscribe({

        next: (response: any) => {

          this.deletingId =
            null;


          if (
            response?.status !== 'success'
          ) {

            this.errorMessage =
              response?.message ||
              'Unable to delete slider.';

            return;

          }


          this.showDeleteModal =
            false;

          this.deleteSliderData =
            null;


          this.successMessage =
            response?.message ||
            'Slider deleted successfully.';


          this.loadSliders();

        },


        error: (error: any) => {

          this.deletingId =
            null;


          this.errorMessage =
            error?.error?.message ||
            'Unable to delete slider.';

        }

      });

  }


  // =========================================================
  // IMAGE ERROR
  // =========================================================

  onImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;


    image.style.display =
      'none';


    const wrapper =
      image.parentElement;


    if (wrapper) {

      wrapper.classList.add(
        'image-error'
      );

    }

  }


  // =========================================================
  // TRACK
  // =========================================================

  trackBySlider(
    index: number,
    slider: any
  ): any {

    return (
      slider?.id ??
      index
    );

  }

}
