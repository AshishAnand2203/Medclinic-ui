import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';

import { ImageCroppedEvent } from 'ngx-image-cropper';

import * as ClassicEditor
    from '@ckeditor/ckeditor5-build-classic';


@Component({
  standalone: false,
    selector: 'app-blog-edit',
    templateUrl: './blog-edit.component.html',
    styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {


    // =========================================================
    // CKEDITOR
    // =========================================================

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
    // BLOG ID
    // =========================================================

    blogId: number = 0;


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
    // EDITOR MODE
    // =========================================================

    editorMode: 'visual' | 'html' = 'visual';

    contentTouched: boolean = false;


    // =========================================================
    // EXISTING IMAGE
    // =========================================================

    existingImage: string = '';

    existingImageUrl: string = '';


    // =========================================================
    // NEW IMAGE / CROPPER
    // =========================================================

    imageChangedEvent: any = '';

    croppedImage: string = '';

    croppedBlob: Blob | null = null;

    previewImage: string = '';

    selectedFileName: string = '';

    showCropperModal: boolean = false;

    cropperLoading: boolean = false;

    imageError: string = '';


    // =========================================================
    // PAGE STATES
    // =========================================================

    isLoading: boolean = true;

    isSubmitting: boolean = false;

    isUploadingImage: boolean = false;

    isRemovingImage: boolean = false;

    successMessage: string = '';

    errorMessage: string = '';


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

        const id =
            Number(
                this.route.snapshot.paramMap.get('id')
            );


        if (
            !id ||
            id <= 0
        ) {

            this.errorMessage =
                'Invalid blog ID.';


            this.isLoading =
                false;


            return;
        }


        this.blogId =
            id;


        this.loadBlog();
    }


    // =========================================================
    // LOAD BLOG
    // =========================================================

    loadBlog(
        showLoader: boolean = true
    ): void {

        if (showLoader) {

            this.isLoading =
                true;
        }


        this.errorMessage =
            '';


        this.apiService
            .get(
                `admin/blogs/${this.blogId}`
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
                            'Unable to load blog.';

                        return;
                    }


                    const blog =
                        response?.data;


                    if (!blog) {

                        this.errorMessage =
                            'Blog not found.';

                        return;
                    }


                    // =========================================
                    // FORM DATA
                    // =========================================

                    this.formData = {

                        title:
                            blog.title || '',

                        slug:
                            blog.slug || '',

                        short_description:
                            blog.short_description || '',

                        content:
                            blog.content || '',

                        author:
                            blog.author || '',

                        published_date:
                            this.normalizeDate(
                                blog.published_date
                            ),

                        meta_title:
                            blog.meta_title || '',

                        meta_description:
                            blog.meta_description || '',

                        meta_keywords:
                            blog.meta_keywords || '',

                        sort_order:
                            Number(
                                blog.sort_order || 0
                            ),

                        status:
                            Number(
                                blog.status
                            ) === 1
                                ? 1
                                : 0
                    };


                    // =========================================
                    // EXISTING IMAGE
                    // =========================================

                    this.existingImage =
                        blog.featured_image || '';


                    this.existingImageUrl =
                        blog.featured_image_url || '';


                    // Clear temporary new image after reload.

                    this.clearNewImage();
                },


                error: (error: any) => {

                    console.error(
                        'Load blog error:',
                        error
                    );


                    this.isLoading =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load blog.';
                }

            });
    }


    // =========================================================
    // NORMALIZE DATE
    // =========================================================

    private normalizeDate(
        value: any
    ): string {

        if (!value) {
            return '';
        }


        const dateValue =
            String(value);


        // Handles:
        // 2026-09-21
        // 2026-09-21 00:00:00
        // 2026-09-21T00:00:00...

        if (
            /^\d{4}-\d{2}-\d{2}/.test(
                dateValue
            )
        ) {

            return dateValue.substring(
                0,
                10
            );
        }


        return '';
    }


    // =========================================================
    // EDITOR MODE
    // =========================================================

    setEditorMode(
        mode: 'visual' | 'html'
    ): void {

        this.editorMode =
            mode;
    }


    // =========================================================
    // EDITOR FOCUS
    // =========================================================

    onEditorFocus(): void {

        this.contentTouched =
            true;
    }


    // =========================================================
    // STRIP HTML
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
    // REGENERATE SLUG
    // =========================================================

    regenerateSlug(): void {

        this.formData.slug =
            this.generateSlug(
                this.formData.title
            );
    }


    // =========================================================
    // SLUG CHANGE
    // =========================================================

    onSlugChange(): void {

        this.formData.slug =
            this.generateSlug(
                this.formData.slug
            );
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
    // FILE SELECTED
    // =========================================================

    onFileSelected(
        event: any
    ): void {

        this.imageError =
            '';


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


        // =========================================
        // TYPE
        // =========================================

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


            input.value =
                '';


            return;
        }


        // =========================================
        // SIZE
        // =========================================

        const maxSize =
            5 * 1024 * 1024;


        if (
            file.size >
            maxSize
        ) {

            this.imageError =
                'Featured image must not exceed 5 MB.';


            input.value =
                '';


            return;
        }


        // =========================================
        // OPEN CROPPER
        // =========================================

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

        this.imageError =
            'Unable to load the selected image.';


        this.closeCropper(
            true
        );
    }


    // =========================================================
    // APPLY CROP
    // =========================================================

    applyCrop(): void {

        if (!this.croppedBlob) {

            this.imageError =
                'Please wait for the cropper to finish.';

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
        clearSelection: boolean
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

                input.value =
                    '';
            }
        }


        document.body.classList.remove(
            'modal-open'
        );
    }


    // =========================================================
    // CLEAR NEW IMAGE
    // =========================================================

    clearNewImage(): void {

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


        const input =
            document.getElementById(
                'blogFeaturedImageInput'
            ) as HTMLInputElement | null;


        if (input) {

            input.value =
                '';
        }
    }


    // =========================================================
    // REMOVE SELECTED NEW IMAGE
    // =========================================================

    removeSelectedImage(): void {

        this.clearNewImage();

        this.imageError =
            '';
    }


    // =========================================================
    // REMOVE EXISTING IMAGE
    // =========================================================

    removeExistingImage(): void {

        if (
            !this.existingImage &&
            !this.existingImageUrl
        ) {
            return;
        }


        const confirmed =
            window.confirm(
                'Are you sure you want to remove the featured image?'
            );


        if (!confirmed) {
            return;
        }


        this.isRemovingImage =
            true;


        this.imageError =
            '';


        this.apiService
            .delete(
                `admin/blogs/${this.blogId}/image`
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
                            'Unable to remove featured image.';

                        return;
                    }


                    this.successMessage =
                        response?.message ||
                        'Featured image removed successfully.';


                    this.existingImage =
                        '';


                    this.existingImageUrl =
                        '';


                    this.clearNewImage();
                },


                error: (error: any) => {

                    console.error(
                        'Remove image error:',
                        error
                    );


                    this.isRemovingImage =
                        false;


                    this.imageError =
                        error?.error?.message ||
                        'Unable to remove featured image.';
                }

            });
    }


    // =========================================================
    // SAVE BLOG
    // =========================================================

    submitForm(): void {

        if (
            this.isSubmitting ||
            this.isUploadingImage
        ) {
            return;
        }


        this.successMessage =
            '';


        this.errorMessage =
            '';


        // =========================================
        // TITLE
        // =========================================

        if (
            !this.formData.title ||
            !this.formData.title.trim()
        ) {

            this.errorMessage =
                'Blog title is required.';

            return;
        }


        // =========================================
        // SLUG
        // =========================================

        if (
            !this.formData.slug ||
            !this.formData.slug.trim()
        ) {

            this.errorMessage =
                'Blog slug is required.';

            return;
        }


        this.formData.slug =
            this.generateSlug(
                this.formData.slug
            );


        // =========================================
        // CONTENT
        // =========================================

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


        // =========================================
        // PAYLOAD
        // =========================================

        const payload = {

            title:
                this.formData.title.trim(),

            slug:
                this.formData.slug.trim(),

            short_description:
                (
                    this.formData.short_description ||
                    ''
                ).trim(),

            content:
                this.formData.content,

            author:
                (
                    this.formData.author ||
                    ''
                ).trim(),

            published_date:
                this.formData.published_date || '',

            meta_title:
                (
                    this.formData.meta_title ||
                    ''
                ).trim(),

            meta_description:
                (
                    this.formData.meta_description ||
                    ''
                ).trim(),

            meta_keywords:
                (
                    this.formData.meta_keywords ||
                    ''
                ).trim(),

            sort_order:
                Number(
                    this.formData.sort_order || 0
                ),

            status:
                Number(
                    this.formData.status
                ) === 1
                    ? 1
                    : 0
        };


        this.isSubmitting =
            true;


        this.apiService
            .put(
                `admin/blogs/${this.blogId}`,
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
                            'Unable to update blog.';

                        return;
                    }


                    // =========================================
                    // NEW IMAGE SELECTED?
                    // =========================================

                    if (this.croppedBlob) {

                        this.uploadFeaturedImage();

                        return;
                    }


                    this.successMessage =
                        response?.message ||
                        'Blog updated successfully.';


                    setTimeout(() => {

                        this.router.navigate([
                            '/blog/list'
                        ]);

                    }, 800);
                },


                error: (error: any) => {

                    console.error(
                        'Update blog error:',
                        error
                    );


                    this.isSubmitting =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to update blog.';
                }

            });
    }


    // =========================================================
    // UPLOAD FEATURED IMAGE
    // =========================================================

    private uploadFeaturedImage(): void {

        if (!this.croppedBlob) {

            this.finishUpdate();

            return;
        }


        this.isUploadingImage =
            true;


        const data =
            new FormData();


        data.append(
            'featured_image',
            this.croppedBlob,
            `blog-${Date.now()}.jpg`
        );


        this.apiService
            .postFormData(
                `admin/blogs/${this.blogId}/upload-image`,
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

                        this.errorMessage =
                            response?.message ||
                            'Blog details were updated, but the featured image could not be uploaded.';

                        return;
                    }


                    // Reload from backend so image URL
                    // always matches the DB record.

                    this.apiService
                        .get(
                            `admin/blogs/${this.blogId}`
                        )
                        .subscribe({

                            next: (reloadResponse: any) => {

                                if (
                                    reloadResponse?.status ===
                                    'success'
                                ) {

                                    const blog =
                                        reloadResponse?.data;


                                    this.existingImage =
                                        blog?.featured_image || '';


                                    this.existingImageUrl =
                                        blog?.featured_image_url || '';
                                }


                                this.clearNewImage();

                                this.finishUpdate();
                            },


                            error: () => {

                                this.clearNewImage();

                                this.finishUpdate();
                            }

                        });
                },


                error: (error: any) => {

                    console.error(
                        'Upload image error:',
                        error
                    );


                    this.isUploadingImage =
                        false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Blog details were updated, but the featured image could not be uploaded.';
                }

            });
    }


    // =========================================================
    // FINISH UPDATE
    // =========================================================

    private finishUpdate(): void {

        this.successMessage =
            'Blog updated successfully.';


        setTimeout(() => {

            this.router.navigate([
                '/blog/list'
            ]);

        }, 800);
    }


    // =========================================================
    // CANCEL
    // =========================================================

    cancel(): void {

        if (
            this.isSubmitting ||
            this.isUploadingImage ||
            this.isRemovingImage
        ) {
            return;
        }


        this.router.navigate([
            '/blog/list'
        ]);
    }
}
