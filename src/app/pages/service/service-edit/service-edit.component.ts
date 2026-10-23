import {
    Component,
    OnInit
} from '@angular/core';

import {
    ActivatedRoute,
    Router
} from '@angular/router';

import {
    NgForm
} from '@angular/forms';

import {
    ApiService
} from '../../../services/api.service';

import * as ClassicEditor
    from '@ckeditor/ckeditor5-build-classic';

import { APP_CONFIG } from '../../../config/app.config';

@Component({
    selector: 'app-service-edit',
    templateUrl: './service-edit.component.html',
    styleUrls: ['./service-edit.component.css']
})
export class ServiceEditComponent implements OnInit {

  appConfig = APP_CONFIG;
    // =========================================================
    // CKEDITOR
    // =========================================================

    public Editor: any =
        ClassicEditor;


    public editorConfig: any = {

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

                'imageUpload',
                'insertTable',
                'blockQuote',

                '|',

                'undo',
                'redo'

            ],

            shouldNotGroupWhenFull: true

        },


        image: {

            toolbar: [

                'imageTextAlternative',

                'toggleImageCaption',

                '|',

                'imageStyle:inline',

                'imageStyle:block',

                'imageStyle:side'

            ]

        },


        table: {

            contentToolbar: [

                'tableColumn',

                'tableRow',

                'mergeTableCells'

            ]

        }

    };


    // =========================================================
    // ID
    // =========================================================

    serviceId: number = 0;


    // =========================================================
    // DATA
    // =========================================================

    service: any = {

        service_type:
            'main',

        parent_id:
            '',

        title:
            '',

        slug:
            '',

        short_description:
            '',

        content:
            '',

        image:
            '',

        icon:
            '',

        sort_order:
            0,

        meta_title:
            '',

        meta_description:
            '',

        meta_keywords:
            '',

        canonical_url:
            '',

        status:
            1

    };


    parentServices: any[] =
        [];


    // =========================================================
    // EDITOR
    // =========================================================

    editorMode:
        'visual' | 'source' =
        'visual';


    // =========================================================
    // STATE
    // =========================================================

    isLoading: boolean =
        true;

    isSaving: boolean =
        false;

    isUploadingImage: boolean =
        false;

    slugManuallyEdited: boolean =
        true;

    metaTitleManuallyEdited: boolean =
        true;

    successMessage: string =
        '';

    errorMessage: string =
        '';

    imageError: string =
        '';

    errors: any =
        {};


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

        this.serviceId =
            Number(
                this.route
                    .snapshot
                    .paramMap
                    .get('id')
            );


        if (
            !this.serviceId ||
            this.serviceId < 1
        ) {

            this.router.navigate([
                '/service/list'
            ]);

            return;

        }


        this.loadParentServices();

        this.loadService();

    }


    // =========================================================
    // LOAD SERVICE
    // =========================================================

    loadService(): void {

        this.isLoading =
            true;

        this.errorMessage =
            '';


        this.apiService
            .get(
                `admin/services/${this.serviceId}`
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isLoading =
                        false;


                    if (
                        !response?.status ||
                        !response?.data
                    ) {

                        this.errorMessage =
                            'Unable to load service.';

                        return;

                    }


                    const data =
                        response.data;


                    this.service = {

                        service_type:
                            data.parent_id
                                ? 'sub'
                                : 'main',

                        parent_id:
                            data.parent_id
                                ? String(
                                    data.parent_id
                                )
                                : '',

                        title:
                            data.title || '',

                        slug:
                            data.slug || '',

                        short_description:
                            data.short_description || '',

                        content:
                            data.content || '',

                        image:
                            data.image || '',

                        icon:
                            data.icon || '',

                        sort_order:
                            Number(
                                data.sort_order || 0
                            ),

                        meta_title:
                            data.meta_title || '',

                        meta_description:
                            data.meta_description || '',

                        meta_keywords:
                            data.meta_keywords || '',

                        canonical_url:
                            data.canonical_url || '',

                        status:
                            Number(
                                data.status
                            )

                    };

                },


                error: (
                    error: any
                ) => {

                    this.isLoading =
                        false;


                    if (
                        error?.status === 404
                    ) {

                        this.errorMessage =
                            'Service not found.';

                        return;

                    }


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to load service.';

                }

            });

    }


    // =========================================================
    // PARENTS
    // =========================================================

    loadParentServices(): void {

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

                        /*
                         * Exclude current service.
                         *
                         * It cannot be its own parent.
                         */
                        this.parentServices =
                            (
                                response.data ||
                                []
                            ).filter(
                                (
                                    item: any
                                ) =>
                                    Number(
                                        item.id
                                    ) !==
                                    this.serviceId
                            );

                    }

                },


                error: () => {

                    this.parentServices =
                        [];

                }

            });

    }


    // =========================================================
    // SERVICE TYPE
    // =========================================================

    onServiceTypeChange(): void {

        if (
            this.service.service_type ===
            'main'
        ) {

            this.service.parent_id =
                '';

        }

    }


    // =========================================================
    // TITLE
    // =========================================================

    onTitleChange(): void {

        /*
         * Existing slug is preserved.
         *
         * Changing a live URL automatically when
         * changing the title is undesirable.
         */

        if (
            !this.slugManuallyEdited
        ) {

            this.service.slug =
                this.generateSlug(
                    this.service.title
                );

        }


        if (
            !this.metaTitleManuallyEdited
        ) {

            this.service.meta_title =
                this.service.title;

        }

    }


    // =========================================================
    // SLUG
    // =========================================================

    onSlugInput(): void {

        this.slugManuallyEdited =
            true;


        this.service.slug =
            this.generateSlug(
                this.service.slug
            );

    }


    generateSlug(
        value: string
    ): string {

        if (!value) {

            return '';

        }


        return value

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
                /^-|-$/g,
                ''
            );

    }


    // =========================================================
    // EDITOR MODE
    // =========================================================

    setEditorMode(
        mode: 'visual' | 'source'
    ): void {

        this.editorMode =
            mode;

    }


    // =========================================================
    // CKEDITOR
    // =========================================================

    onEditorReady(
        editor: any
    ): void {

        const fileRepository =
            editor.plugins.get(
                'FileRepository'
            );


        fileRepository
            .createUploadAdapter =
            (
                loader: any
            ) => {

                return new ServiceEditorImageAdapter(
                    loader,
                    this.apiService
                );

            };

    }


    // =========================================================
    // FEATURE IMAGE
    // =========================================================

    onImageSelected(
        event: Event
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
                'Only JPG, PNG and WEBP images are allowed.';


            input.value =
                '';


            return;

        }


        // =====================================================
        // SIZE
        // =====================================================

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            this.imageError =
                'Image size cannot exceed 5 MB.';


            input.value =
                '';


            return;

        }


        // =====================================================
        // UPLOAD
        // =====================================================

        const formData =
            new FormData();


        formData.append(
            'image',
            file,
            file.name
        );


        this.isUploadingImage =
            true;


        this.apiService
            .postFormData(
                'admin/services/upload-image',
                formData
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isUploadingImage =
                        false;


                    if (
                        response?.status &&
                        response?.url
                    ) {

                        this.service.image =
                            response.url;

                    } else {

                        this.imageError =
                            response?.message ||
                            'Unable to upload image.';

                    }

                },


                error: (
                    error: any
                ) => {

                    this.isUploadingImage =
                        false;


                    this.imageError =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to upload image.';

                }

            });

    }


    // =========================================================
    // REMOVE IMAGE
    // =========================================================

    removeImage(): void {

        /*
         * This removes the image from the service record
         * after Update Service is clicked.
         *
         * It does not physically delete the file yet.
         */

        this.service.image =
            '';

        this.imageError =
            '';

    }


    // =========================================================
    // META
    // =========================================================

    get metaTitleLength(): number {

        return (
            this.service.meta_title ||
            ''
        ).length;

    }


    get metaDescriptionLength(): number {

        return (
            this.service.meta_description ||
            ''
        ).length;

    }


    // =========================================================
    // UPDATE
    // =========================================================

    updateService(
        form: NgForm
    ): void {

        this.successMessage =
            '';

        this.errorMessage =
            '';

        this.errors =
            {};


        // =====================================================
        // FORM VALIDATION
        // =====================================================

        if (
            form.invalid
        ) {

            Object.keys(
                form.controls
            ).forEach(
                (
                    key: string
                ) => {

                    form.controls[key]
                        .markAsTouched();

                }
            );


            this.errorMessage =
                'Please complete the required fields.';


            return;

        }


        // =====================================================
        // TITLE
        // =====================================================

        if (
            !this.service.title ||
            !this.service.title.trim()
        ) {

            this.errors.title =
                'Service title is required.';


            this.errorMessage =
                'Service title is required.';


            return;

        }


        // =====================================================
        // SLUG
        // =====================================================

        if (
            !this.service.slug ||
            !this.service.slug.trim()
        ) {

            this.errors.slug =
                'Service URL is required.';


            this.errorMessage =
                'Service URL is required.';


            return;

        }


        // =====================================================
        // PARENT
        // =====================================================

        if (
            this.service.service_type ===
                'sub' &&
            !this.service.parent_id
        ) {

            this.errors.parent_id =
                'Please select a parent service.';


            this.errorMessage =
                'Please select a parent service.';


            return;

        }


        // =====================================================
        // IMAGE UPLOAD
        // =====================================================

        if (
            this.isUploadingImage
        ) {

            this.errorMessage =
                'Please wait for the image upload to finish.';


            return;

        }


        // =====================================================
        // PAYLOAD
        // =====================================================

        const data = {

            parent_id:

                this.service.service_type ===
                'sub'

                    ? Number(
                        this.service.parent_id
                    )

                    : null,


            title:
                this.service.title.trim(),


            slug:
                this.generateSlug(
                    this.service.slug
                ),


            short_description:
                this.service
                    .short_description
                    ?.trim() || '',


            content:
                this.service.content || '',


            image:
                this.service.image || '',


            icon:
                this.service.icon
                    ?.trim() || '',


            sort_order:
                Number(
                    this.service.sort_order
                ) || 0,


            meta_title:
                this.service
                    .meta_title
                    ?.trim() || '',


            meta_description:
                this.service
                    .meta_description
                    ?.trim() || '',


            meta_keywords:
                this.service
                    .meta_keywords
                    ?.trim() || '',


            canonical_url:
                this.service
                    .canonical_url
                    ?.trim() || '',


            status:
                Number(
                    this.service.status
                )

        };


        // =====================================================
        // UPDATE API
        // =====================================================

        this.isSaving =
            true;


        this.apiService
            .put(
                `admin/services/${this.serviceId}`,
                data
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isSaving =
                        false;


                    if (
                        response?.status
                    ) {

                        this.successMessage =
                            response.message ||
                            'Service updated successfully.';


                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });

                    }

                },


                error: (
                    error: any
                ) => {

                    this.isSaving =
                        false;


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to update service.';


                    this.errors =

                        error
                            ?.error
                            ?.errors

                        ||

                        {};


                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });

                }

            });

    }


    // =========================================================
    // CANCEL
    // =========================================================

    cancel(): void {

        this.router.navigate([
            '/service/list'
        ]);

    }

}



/* ============================================================
   CKEDITOR INLINE IMAGE UPLOAD
============================================================ */

class ServiceEditorImageAdapter {

    constructor(
        private loader: any,
        private apiService: ApiService
    ) {}


    upload(): Promise<any> {

        return this.loader.file

            .then(
                (
                    file: File
                ) => {

                    return new Promise(
                        (
                            resolve,
                            reject
                        ) => {

                            const formData =
                                new FormData();


                            formData.append(
                                'image',
                                file,
                                file.name
                            );


                            this.apiService
                                .postFormData(
                                    'admin/editor/upload-image',
                                    formData
                                )
                                .subscribe({

                                    next: (
                                        response: any
                                    ) => {

                                        if (
                                            !response?.status ||
                                            !response?.url
                                        ) {

                                            reject(

                                                response
                                                    ?.message

                                                ||

                                                'Image upload failed.'

                                            );


                                            return;

                                        }


                                        resolve({

                                            default:
                                                response.url

                                        });

                                    },


                                    error: (
                                        error: any
                                    ) => {

                                        reject(

                                            error
                                                ?.error
                                                ?.message

                                            ||

                                            'Image upload failed.'

                                        );

                                    }

                                });

                        }
                    );

                }
            );

    }


    abort(): void {}

}
