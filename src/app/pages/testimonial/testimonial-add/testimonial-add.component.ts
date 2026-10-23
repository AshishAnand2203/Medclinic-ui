import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  standalone: false,
    selector: 'app-testimonial-add',
    templateUrl: './testimonial-add.component.html',
    styleUrls: ['./testimonial-add.component.css']
})
export class TestimonialAddComponent {

    // =========================================================
    // FORM DATA
    // =========================================================

    formData: any = {
        name: '',
        designation: '',
        testimonial: '',
        rating: 5,
        sort_order: 0,
        status: 1
    };


    // =========================================================
    // IMAGE CROPPER
    // =========================================================

    imageChangedEvent: any = '';

    croppedImage: string = '';

    croppedBlob: Blob | null = null;

    previewImage: string = '';

    selectedFileName: string = '';

    showCropperModal: boolean = false;

    cropperLoading: boolean = false;


    // =========================================================
    // STATES
    // =========================================================

    isSubmitting: boolean = false;

    successMessage: string = '';

    errorMessage: string = '';

    imageError: string = '';


    // =========================================================
    // RATING
    // =========================================================

    ratings: number[] = [
        1,
        2,
        3,
        4,
        5
    ];


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    // =========================================================
    // SELECT RATING
    // =========================================================

    setRating(rating: number): void {

        this.formData.rating = rating;
    }


    // =========================================================
    // FILE SELECTED
    // =========================================================

    onFileSelected(event: any): void {

        this.imageError = '';

        const input =
            event.target as HTMLInputElement;

        if (
            !input.files ||
            input.files.length === 0
        ) {
            return;
        }


        const file =
            input.files[0];


        // =====================================================
        // TYPE
        // =====================================================

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            this.imageError =
                'Please select a JPG, PNG or WEBP image.';

            input.value = '';

            return;
        }


        // =====================================================
        // SIZE - 5 MB
        // =====================================================

        const maxSize =
            5 * 1024 * 1024;


        if (
            file.size >
            maxSize
        ) {

            this.imageError =
                'Image size must not exceed 5 MB.';

            input.value = '';

            return;
        }


        // =====================================================
        // OPEN CROPPER
        // =====================================================

        this.selectedFileName =
            file.name;

        this.imageChangedEvent =
            event;

        this.croppedImage = '';

        this.croppedBlob = null;

        this.cropperLoading = true;

        this.showCropperModal = true;

        document.body.classList.add(
            'modal-open'
        );
    }


    // =========================================================
    // IMAGE CROPPED
    // =========================================================

    imageCropped(
        event: ImageCroppedEvent
    ): void {

        if (event.objectUrl) {

            this.croppedImage =
                event.objectUrl;
        }


        if (event.blob) {

            this.croppedBlob =
                event.blob;
        }
    }


    // =========================================================
    // IMAGE LOADED
    // =========================================================

    imageLoaded(): void {

        this.cropperLoading = false;
    }


    // =========================================================
    // CROPPER READY
    // =========================================================

    cropperReady(): void {

        this.cropperLoading = false;
    }


    // =========================================================
    // LOAD IMAGE FAILED
    // =========================================================

    loadImageFailed(): void {

        this.cropperLoading = false;

        this.imageError =
            'Unable to load the selected image. Please try another image.';

        this.closeCropper();
    }


    // =========================================================
    // APPLY CROP
    // =========================================================

    applyCrop(): void {

        if (
            !this.croppedBlob
        ) {

            this.imageError =
                'Please wait for the image cropper to finish.';

            return;
        }


        if (
            this.previewImage &&
            this.previewImage.startsWith(
                'blob:'
            )
        ) {

            URL.revokeObjectURL(
                this.previewImage
            );
        }


        this.previewImage =
            URL.createObjectURL(
                this.croppedBlob
            );


        this.showCropperModal =
            false;


        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // CANCEL CROPPER
    // =========================================================

    cancelCrop(): void {

        this.closeCropper();
    }


    // =========================================================
    // CLOSE CROPPER
    // =========================================================

    private closeCropper(): void {

        this.showCropperModal =
            false;

        this.cropperLoading =
            false;

        this.imageChangedEvent =
            '';

        this.croppedImage =
            '';

        this.croppedBlob =
            null;


        const input =
            document.getElementById(
                'testimonialImageInput'
            ) as HTMLInputElement | null;


        if (input) {
            input.value = '';
        }


        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // REMOVE IMAGE
    // =========================================================

    removeImage(): void {

        if (
            this.previewImage &&
            this.previewImage.startsWith(
                'blob:'
            )
        ) {

            URL.revokeObjectURL(
                this.previewImage
            );
        }


        this.previewImage = '';

        this.croppedImage = '';

        this.croppedBlob = null;

        this.imageChangedEvent = '';

        this.selectedFileName = '';

        this.imageError = '';


        const input =
            document.getElementById(
                'testimonialImageInput'
            ) as HTMLInputElement | null;


        if (input) {
            input.value = '';
        }
    }


    // =========================================================
    // SUBMIT
    // =========================================================

    submitForm(): void {

        this.successMessage = '';

        this.errorMessage = '';

        this.imageError = '';


        // =====================================================
        // NAME
        // =====================================================

        if (
            !this.formData.name ||
            !this.formData.name.trim()
        ) {

            this.errorMessage =
                'Patient name is required.';

            return;
        }


        // =====================================================
        // TESTIMONIAL
        // =====================================================

        if (
            !this.formData.testimonial ||
            !this.formData.testimonial.trim()
        ) {

            this.errorMessage =
                'Testimonial is required.';

            return;
        }


        // =====================================================
        // RATING
        // =====================================================

        const rating =
            Number(
                this.formData.rating
            );


        if (
            rating < 1 ||
            rating > 5
        ) {

            this.errorMessage =
                'Please select a valid rating.';

            return;
        }


        // =====================================================
        // FORM DATA
        // =====================================================

        const data =
            new FormData();


        data.append(
            'name',
            this.formData.name.trim()
        );


        data.append(
            'designation',
            (
                this.formData.designation ||
                ''
            ).trim()
        );


        data.append(
            'testimonial',
            this.formData.testimonial.trim()
        );


        data.append(
            'rating',
            String(
                this.formData.rating
            )
        );


        data.append(
            'sort_order',
            String(
                this.formData.sort_order || 0
            )
        );


        data.append(
            'status',
            String(
                this.formData.status
            )
        );


        // =====================================================
        // OPTIONAL IMAGE
        // =====================================================

        if (
            this.croppedBlob
        ) {

            data.append(
                'image',
                this.croppedBlob,
                `testimonial-${Date.now()}.jpg`
            );
        }


        // =====================================================
        // SUBMIT
        // =====================================================

        this.isSubmitting = true;


        this.apiService
            .postFormData(
                'admin/testimonials',
                data
            )
            .subscribe({

                next: (response: any) => {

                    this.isSubmitting =
                        false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to create testimonial.';

                        return;
                    }


                    this.successMessage =
                        response?.message ||
                        'Testimonial created successfully.';


                    setTimeout(() => {

                        this.router.navigate([
                            '/testimonial/list'
                        ]);

                    }, 800);
                },


                error: (error: any) => {

                    console.error(
                        'Create testimonial error:',
                        error
                    );


                    this.isSubmitting =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to create testimonial.';
                }

            });
    }


    // =========================================================
    // CANCEL
    // =========================================================

    cancel(): void {

        this.router.navigate([
            '/testimonial/list'
        ]);
    }
}
