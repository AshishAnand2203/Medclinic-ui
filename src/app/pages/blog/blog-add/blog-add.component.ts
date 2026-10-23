import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import * as ClassicEditor
    from '@ckeditor/ckeditor5-build-classic';

@Component({
  standalone: false,
    selector: 'app-blog-add',
    templateUrl: './blog-add.component.html',
    styleUrls: ['./blog-add.component.css']
})
export class BlogAddComponent {

    // =========================================================
    // CKEDITOR
    // =========================================================

    // =========================================================
// EDITOR MODE
// =========================================================

editorMode: 'visual' | 'html' = 'visual';


// =========================================================
// CHANGE EDITOR MODE
// =========================================================

setEditorMode(
    mode: 'visual' | 'html'
): void {

    this.editorMode = mode;
}

    public Editor: any =
    (ClassicEditor as any).default || ClassicEditor;

    public editorConfig: any = {

        placeholder: 'Write your blog content here...',

        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'link',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'blockQuote',
                'insertTable',
                '|',
                'undo',
                'redo'
            ],

            shouldNotGroupWhenFull: true
        },

        heading: {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph'
                },
                {
                    model: 'heading1',
                    view: 'h2',
                    title: 'Heading 2',
                    class: 'ck-heading_heading1'
                },
                {
                    model: 'heading2',
                    view: 'h3',
                    title: 'Heading 3',
                    class: 'ck-heading_heading2'
                },
                {
                    model: 'heading3',
                    view: 'h4',
                    title: 'Heading 4',
                    class: 'ck-heading_heading3'
                }
            ]
        },

        link: {
            addTargetToExternalLinks: true
        }
    };


    // =========================================================
    // FORM DATA
    // =========================================================

    formData: any = {
        title: '',
        slug: '',
        short_description: '',
        content: '',
        author: '',
        published_date: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        sort_order: 0,
        status: 1
    };


    // =========================================================
    // SLUG
    // =========================================================

    slugManuallyEdited: boolean = false;


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

    contentTouched: boolean = false;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    // =========================================================
    // TITLE CHANGE
    // =========================================================

    onTitleChange(): void {

        if (!this.slugManuallyEdited) {

            this.formData.slug =
                this.generateSlug(
                    this.formData.title
                );
        }


        // Auto-fill meta title initially.

        if (!this.formData.meta_title) {

            this.formData.meta_title =
                this.formData.title;
        }
    }


    // =========================================================
    // SLUG CHANGE
    // =========================================================

    onSlugChange(): void {

        this.slugManuallyEdited =
            true;


        this.formData.slug =
            this.generateSlug(
                this.formData.slug
            );
    }


    // =========================================================
    // REGENERATE SLUG
    // =========================================================

    regenerateSlug(): void {

        this.formData.slug =
            this.generateSlug(
                this.formData.title
            );


        this.slugManuallyEdited =
            false;
    }


    // =========================================================
    // GENERATE SLUG
    // =========================================================

    private generateSlug(
        value: string
    ): string {

        if (!value) {
            return '';
        }


        return value

            .toString()

            .toLowerCase()

            .trim()

            .replace(
                /[^a-z0-9\s-]/g,
                ''
            )

            .replace(
                /\s+/g,
                '-'
            )

            .replace(
                /-+/g,
                '-'
            )

            .replace(
                /^-+|-+$/g,
                ''
            );
    }


    // =========================================================
    // CKEDITOR FOCUS
    // =========================================================

    onEditorFocus(): void {

        this.contentTouched =
            true;
    }


    // =========================================================
    // STRIP HTML CONTENT
    // =========================================================

    stripHtmlContent(
        value: string
    ): string {

        if (!value) {
            return '';
        }


        const element =
            document.createElement(
                'div'
            );


        element.innerHTML =
            value;


        return (
            element.textContent ||
            element.innerText ||
            ''
        )
            .replace(
                /\u00a0/g,
                ' '
            )
            .trim();
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
                'Featured image must not exceed 5 MB.';


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
    // IMAGE LOAD FAILED
    // =========================================================

    loadImageFailed(): void {

        this.imageError =
            'Unable to load the selected image. Please try another image.';


        this.closeCropper(
            false
        );
    }


    // =========================================================
    // APPLY CROP
    // =========================================================

    applyCrop(): void {

        if (!this.croppedBlob) {

            this.imageError =
                'Please wait for the image cropper to finish.';

            return;
        }


        // Remove previous temporary preview URL.

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


        this.cropperLoading =
            false;


        this.imageChangedEvent =
            '';


        this.croppedImage =
            '';


        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // CANCEL CROP
    // =========================================================

    cancelCrop(): void {

        this.closeCropper(
            true
        );
    }


    // =========================================================
    // CLOSE CROPPER
    // =========================================================

    private closeCropper(
        clearSelection: boolean = true
    ): void {

        this.showCropperModal =
            false;


        this.cropperLoading =
            false;


        this.imageChangedEvent =
            '';


        this.croppedImage =
            '';


        if (clearSelection) {

            this.croppedBlob =
                null;


            this.selectedFileName =
                '';


            const input =
                document.getElementById(
                    'blogFeaturedImageInput'
                ) as HTMLInputElement | null;


            if (input) {

                input.value = '';
            }
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


        this.previewImage =
            '';


        this.croppedImage =
            '';


        this.croppedBlob =
            null;


        this.imageChangedEvent =
            '';


        this.selectedFileName =
            '';


        this.imageError =
            '';


        const input =
            document.getElementById(
                'blogFeaturedImageInput'
            ) as HTMLInputElement | null;


        if (input) {

            input.value = '';
        }
    }


    // =========================================================
    // SUBMIT FORM
    // =========================================================

    submitForm(): void {

        if (this.isSubmitting) {
            return;
        }


        this.successMessage = '';

        this.errorMessage = '';

        this.imageError = '';


        // =====================================================
        // TITLE VALIDATION
        // =====================================================

        if (
            !this.formData.title ||
            !this.formData.title.trim()
        ) {

            this.errorMessage =
                'Blog title is required.';

            return;
        }


        // =====================================================
        // SLUG
        // =====================================================

        if (
            !this.formData.slug ||
            !this.formData.slug.trim()
        ) {

            this.formData.slug =
                this.generateSlug(
                    this.formData.title
                );
        }


        if (!this.formData.slug) {

            this.errorMessage =
                'Blog slug is required.';

            return;
        }


        // =====================================================
        // CONTENT VALIDATION
        // =====================================================

        if (
            !this.stripHtmlContent(
                this.formData.content
            )
        ) {

            this.contentTouched =
                true;


            this.errorMessage =
                'Blog content is required.';

            return;
        }


        // =====================================================
        // CREATE FORMDATA
        // =====================================================

        const data =
            new FormData();


        data.append(
            'title',
            this.formData.title.trim()
        );


        data.append(
            'slug',
            this.formData.slug.trim()
        );


        data.append(
            'short_description',
            (
                this.formData.short_description ||
                ''
            ).trim()
        );


        // CKEditor HTML
        data.append(
            'content',
            this.formData.content
        );


        data.append(
            'author',
            (
                this.formData.author ||
                ''
            ).trim()
        );


        data.append(
            'published_date',
            this.formData.published_date || ''
        );


        data.append(
            'meta_title',
            (
                this.formData.meta_title ||
                ''
            ).trim()
        );


        data.append(
            'meta_description',
            (
                this.formData.meta_description ||
                ''
            ).trim()
        );


        data.append(
            'meta_keywords',
            (
                this.formData.meta_keywords ||
                ''
            ).trim()
        );


        data.append(
            'sort_order',
            String(
                Number(
                    this.formData.sort_order || 0
                )
            )
        );


        data.append(
            'status',
            String(
                Number(
                    this.formData.status
                ) === 1
                    ? 1
                    : 0
            )
        );


        // =====================================================
        // FEATURED IMAGE
        // =====================================================

        if (this.croppedBlob) {

            data.append(
                'featured_image',
                this.croppedBlob,
                `blog-${Date.now()}.jpg`
            );
        }


        // =====================================================
        // SUBMIT
        // =====================================================

        this.isSubmitting =
            true;


        this.apiService
            .postFormData(
                'admin/blogs',
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
                            'Unable to create blog.';

                        return;
                    }


                    this.successMessage =
                        response?.message ||
                        'Blog created successfully.';


                    setTimeout(() => {

                        this.router.navigate([
                            '/blog/list'
                        ]);

                    }, 800);
                },


                error: (error: any) => {

                    console.error(
                        'Create blog error:',
                        error
                    );


                    this.isSubmitting =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to create blog.';
                }

            });
    }


    // =========================================================
    // CANCEL
    // =========================================================

    cancel(): void {

        if (this.isSubmitting) {
            return;
        }


        this.router.navigate([
            '/blog/list'
        ]);
    }
}
