import {
    Component
} from '@angular/core';

import {
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
  standalone: false,
    selector: 'app-page-add',
    templateUrl: './page-add.component.html',
    styleUrls: ['./page-add.component.css']
})
export class PageAddComponent {
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
    // HTML MODE
    // =========================================================

    editorMode:
        'visual' | 'source' =
        'visual';


    // =========================================================
    // FORM
    // =========================================================

    page: any = {

        title: '',

        slug: '',

        short_description: '',

        content: '',

        meta_title: '',

        meta_description: '',

        meta_keywords: '',

        canonical_url: '',

        status: 1

    };


    // =========================================================
    // STATE
    // =========================================================

    isSaving: boolean = false;

    slugManuallyEdited: boolean = false;

    metaTitleManuallyEdited: boolean = false;

    successMessage: string = '';

    errorMessage: string = '';

    errors: any = {};


    constructor(
        private apiService: ApiService,
        private router: Router
    ) {}


    // =========================================================
    // EDITOR READY
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
            (loader: any) => {

                return new PageImageUploadAdapter(
                    loader,
                    this.apiService
                );

            };

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
    // TITLE
    // =========================================================

    onTitleChange(): void {

        if (
            !this.slugManuallyEdited
        ) {

            this.page.slug =
                this.generateSlug(
                    this.page.title
                );

        }


        if (
            !this.metaTitleManuallyEdited
        ) {

            this.page.meta_title =
                this.page.title;

        }

    }


    // =========================================================
    // SLUG
    // =========================================================

    onSlugInput(): void {

        this.slugManuallyEdited =
            true;


        this.page.slug =
            this.generateSlug(
                this.page.slug
            );

    }


    // =========================================================
    // GENERATE SLUG
    // =========================================================

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
    // META LENGTH
    // =========================================================

    get metaTitleLength(): number {

        return (
            this.page.meta_title ||
            ''
        ).length;

    }


    get metaDescriptionLength(): number {

        return (
            this.page.meta_description ||
            ''
        ).length;

    }


    // =========================================================
    // SAVE
    // =========================================================

    savePage(
        form: NgForm
    ): void {

        this.successMessage = '';

        this.errorMessage = '';

        this.errors = {};


        // =====================================================
        // VALIDATION
        // =====================================================

        if (form.invalid) {

            Object.keys(
                form.controls
            ).forEach(
                (key: string) => {

                    form.controls[key]
                        .markAsTouched();

                }
            );


            this.errorMessage =
                'Please complete the required fields.';


            return;

        }


        if (
            !this.page.title ||
            !this.page.title.trim()
        ) {

            this.errors.title =
                'Page title is required.';


            return;

        }


        if (
            !this.page.slug ||
            !this.page.slug.trim()
        ) {

            this.errors.slug =
                'Page URL is required.';


            return;

        }


        // =====================================================
        // DATA
        // =====================================================

        const data = {

            title:
                this.page.title.trim(),

            slug:
                this.generateSlug(
                    this.page.slug
                ),

            short_description:
                this.page
                    .short_description
                    ?.trim() || '',

            content:
                this.page.content || '',

            meta_title:
                this.page
                    .meta_title
                    ?.trim() || '',

            meta_description:
                this.page
                    .meta_description
                    ?.trim() || '',

            meta_keywords:
                this.page
                    .meta_keywords
                    ?.trim() || '',

            canonical_url:
                this.page
                    .canonical_url
                    ?.trim() || '',

            status:
                Number(
                    this.page.status
                )

        };


        // =====================================================
        // API
        // =====================================================

        this.isSaving =
            true;


        this.apiService
            .post(
                'admin/pages',
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
                            'Page created successfully.';


                        setTimeout(
                            () => {

                                this.router
                                    .navigate([
                                        '/page/list'
                                    ]);

                            },
                            700
                        );

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

                        'Unable to create page. Please try again.';


                    this.errors =

                        error
                            ?.error
                            ?.errors

                        ||

                        {};

                }

            });

    }


    // =========================================================
    // CANCEL
    // =========================================================

    cancel(): void {

        this.router.navigate([
            '/page/list'
        ]);

    }

}



/* ============================================================
   CKEDITOR IMAGE UPLOAD ADAPTER
============================================================ */

class PageImageUploadAdapter {

    constructor(
        private loader: any,
        private apiService: ApiService
    ) {}


    upload(): Promise<any> {

        return this.loader.file

            .then(
                (file: File) => {

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
                                                    ?.message ||
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


    abort(): void {
    }

}
