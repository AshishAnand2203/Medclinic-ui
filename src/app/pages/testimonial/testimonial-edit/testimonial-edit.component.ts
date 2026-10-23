import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  standalone: false,
    selector: 'app-testimonial-edit',
    templateUrl: './testimonial-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./testimonial-edit.component.css']
})
export class TestimonialEditComponent implements OnInit {

    // =========================================================
    // ID
    // =========================================================

    testimonialId: number = 0;


    // =========================================================
    // FORM DATA
    // =========================================================

    formData: any = {
        name: '',
        designation: '',
        testimonial: '',
        rating: 5,
        image: '',
        image_url: '',
        sort_order: 0,
        status: 1
    };


    // =========================================================
    // STATES
    // =========================================================

    isLoading: boolean = true;
    isSubmitting: boolean = false;
    isUploadingImage: boolean = false;
    isRemovingImage: boolean = false;

    successMessage: string = '';
    errorMessage: string = '';
    imageError: string = '';


    // =========================================================
    // IMAGE CROPPER
    // =========================================================

    imageChangedEvent: any = '';

    croppedImage: string = '';

    croppedBlob: Blob | null = null;

    cropperLoading: boolean = false;

    showCropperModal: boolean = false;

    selectedFileName: string = '';


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
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService
    ) {}


    // =========================================================
    // INIT
    // =========================================================

    ngOnInit(): void {

        this.testimonialId =
            Number(
                this.route.snapshot.paramMap.get('id')
            );


        if (
            !this.testimonialId ||
            this.testimonialId <= 0
        ) {

            this.errorMessage =
                'Invalid testimonial ID.';

            this.isLoading =
                false;

            return;
        }


        this.loadTestimonial();
    }


    // =========================================================
    // LOAD TESTIMONIAL
    // =========================================================

    loadTestimonial(): void {

        this.isLoading = true;

        this.errorMessage = '';


        this.apiService
            .get(
                `admin/testimonials/${this.testimonialId}`
            )
            .subscribe({

                next: (response: any) => {

                    this.isLoading =
                        false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to load testimonial.';

                        return;
                    }


                    const data =
                        response?.data || {};


                    this.formData = {

                        name:
                            data?.name || '',

                        designation:
                            data?.designation || '',

                        testimonial:
                            data?.testimonial || '',

                        rating:
                            Number(
                                data?.rating || 5
                            ),

                        image:
                            data?.image || '',

                        image_url:
                            data?.image_url || '',

                        sort_order:
                            Number(
                                data?.sort_order || 0
                            ),

                        status:
                            Number(data?.status) === 1
                                ? 1
                                : 0
                    };
                },


                error: (error: any) => {

                    console.error(
                        'Load testimonial error:',
                        error
                    );


                    this.isLoading =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load testimonial.';
                }

            });
    }


    // =========================================================
    // SET RATING
    // =========================================================

    setRating(
        rating: number
    ): void {

        this.formData.rating =
            rating;
    }


    // =========================================================
    // FILE SELECTED
    // =========================================================

    onFileSelected(
        event: any
    ): void {

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
        // FILE TYPE
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
        // FILE SIZE
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

        this.croppedImage =
            '';

        this.croppedBlob =
            null;

        this.cropperLoading =
            true;

        this.showCropperModal =
            true;


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

        this.cropperLoading =
            false;
    }


    // =========================================================
    // CROPPER READY
    // =========================================================

    cropperReady(): void {

        this.cropperLoading =
            false;
    }


    // =========================================================
    // LOAD IMAGE FAILED
    // =========================================================

    loadImageFailed(): void {

        this.cropperLoading =
            false;


        this.imageError =
            'Unable to load the selected image.';


        this.closeCropper();
    }


    // =========================================================
    // APPLY CROP + UPLOAD
    // =========================================================

    applyCrop(): void {

        if (
            !this.croppedBlob ||
            this.isUploadingImage
        ) {

            if (!this.croppedBlob) {

                this.imageError =
                    'Please wait for the cropper to finish.';
            }

            return;
        }


        this.uploadCroppedImage();
    }


    // =========================================================
    // UPLOAD CROPPED IMAGE
    // =========================================================

    uploadCroppedImage(): void {

        if (!this.croppedBlob) {
            return;
        }


        this.imageError = '';

        this.isUploadingImage =
            true;


        const data =
            new FormData();


        data.append(
            'image',
            this.croppedBlob,
            `testimonial-${Date.now()}.jpg`
        );


        this.apiService
            .postFormData(
                `admin/testimonials/${this.testimonialId}/upload-image`,
                data
            )
            .subscribe({

                next: (response: any) => {

                    this.isUploadingImage =
                        false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.imageError =
                            response?.message ||
                            'Unable to update testimonial image.';

                        return;
                    }


                    // =========================================
                    // IMPORTANT
                    // Use backend URL, not temporary blob URL.
                    // =========================================

                    this.formData.image =
                        response?.image || '';


                    this.formData.image_url =
                        response?.url || '';


                    this.showCropperModal =
                        false;


                    this.imageChangedEvent =
                        '';

                    this.croppedImage =
                        '';

                    this.croppedBlob =
                        null;


                    document.body.classList.remove(
                        'modal-open'
                    );


                    this.successMessage =
                        response?.message ||
                        'Testimonial image updated successfully.';


                    this.clearSuccessMessage();
                },


                error: (error: any) => {

                    console.error(
                        'Upload testimonial image error:',
                        error
                    );


                    this.isUploadingImage =
                        false;


                    this.imageError =
                        error?.error?.message ||
                        'Unable to update testimonial image.';
                }

            });
    }


    // =========================================================
    // CANCEL CROP
    // =========================================================

    cancelCrop(): void {

        if (this.isUploadingImage) {
            return;
        }


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

        this.selectedFileName =
            '';


        const input =
            document.getElementById(
                'testimonialEditImageInput'
            ) as HTMLInputElement | null;


        if (input) {
            input.value = '';
        }


        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // REMOVE EXISTING IMAGE
    // =========================================================

    removeImage(): void {

        if (
            !this.formData.image ||
            this.isRemovingImage
        ) {
            return;
        }


        const confirmed =
            window.confirm(
                'Are you sure you want to remove this testimonial image?'
            );


        if (!confirmed) {
            return;
        }


        this.imageError = '';

        this.successMessage = '';

        this.isRemovingImage =
            true;


        this.apiService
            .delete(
                `admin/testimonials/${this.testimonialId}/image`
            )
            .subscribe({

                next: (response: any) => {

                    this.isRemovingImage =
                        false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.imageError =
                            response?.message ||
                            'Unable to remove testimonial image.';

                        return;
                    }


                    this.formData.image =
                        '';

                    this.formData.image_url =
                        '';


                    this.successMessage =
                        response?.message ||
                        'Testimonial image removed successfully.';


                    this.clearSuccessMessage();
                },


                error: (error: any) => {

                    console.error(
                        'Remove testimonial image error:',
                        error
                    );


                    this.isRemovingImage =
                        false;


                    this.imageError =
                        error?.error?.message ||
                        'Unable to remove testimonial image.';
                }

            });
    }


    // =========================================================
    // UPDATE TESTIMONIAL
    // =========================================================

    submitForm(): void {

        this.errorMessage = '';

        this.successMessage = '';


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
        // PAYLOAD
        // =====================================================

        const payload = {

            name:
                this.formData.name.trim(),

            designation:
                (
                    this.formData.designation ||
                    ''
                ).trim(),

            testimonial:
                this.formData.testimonial.trim(),

            rating:
                Number(
                    this.formData.rating
                ),

            image:
                this.formData.image || '',

            sort_order:
                Number(
                    this.formData.sort_order || 0
                ),

            status:
                Number(this.formData.status) === 1
                    ? 1
                    : 0
        };


        this.isSubmitting =
            true;


        this.apiService
            .put(
                `admin/testimonials/${this.testimonialId}`,
                payload
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
                            'Unable to update testimonial.';

                        return;
                    }


                    if (response?.data) {

                        this.formData.image =
                            response.data.image || '';


                        this.formData.image_url =
                            response.data.image_url || '';
                    }


                    this.successMessage =
                        response?.message ||
                        'Testimonial updated successfully.';


                    setTimeout(() => {

                        this.router.navigate([
                            '/testimonial/list'
                        ]);

                    }, 800);
                },


                error: (error: any) => {

                    console.error(
                        'Update testimonial error:',
                        error
                    );


                    this.isSubmitting =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to update testimonial.';
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


    // =========================================================
    // CLEAR SUCCESS
    // =========================================================

    private clearSuccessMessage(): void {

        setTimeout(() => {

            this.successMessage = '';

        }, 3000);
    }
}
