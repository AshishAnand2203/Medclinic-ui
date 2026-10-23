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
  standalone: false,
    selector: 'app-page-edit',
    templateUrl: './page-edit.component.html',
    styleUrls: ['./page-edit.component.css']
})
export class PageEditComponent implements OnInit {
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
    // PAGE ID
    // =========================================================

    pageId: number = 0;


    // =========================================================
    // EDITOR MODE
    // =========================================================

    editorMode:
        'visual' | 'source' =
        'visual';


    // =========================================================
    // PAGE
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

    isLoading: boolean = true;

    isSaving: boolean = false;

    slugManuallyEdited: boolean = false;

    metaTitleManuallyEdited: boolean = false;

    successMessage: string = '';

    errorMessage: string = '';

    errors: any = {};


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

        this.pageId =
            Number(
                this.route.snapshot
                    .paramMap
                    .get('id')
            );


        if (
            !this.pageId ||
            this.pageId < 1
        ) {

            this.router.navigate([
                '/page/list'
            ]);

            return;

        }


        this.loadPage();

    }


    // =========================================================
    // LOAD PAGE
    // =========================================================

    loadPage(): void {

        this.isLoading =
            true;


        this.errorMessage =
            '';


        this.apiService
            .get(
                `admin/pages/${this.pageId}`
            )
            .subscribe({

                // =================================================
                // SUCCESS
                // =================================================

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
                            'Unable to load page.';

                        return;

                    }


                    const data =
                        response.data;


                    // =============================================
                    // SET FORM DATA
                    // =============================================

                    this.page = {

                        title:
                            data.title || '',

                        slug:
                            data.slug || '',

                        short_description:
                            data.short_description || '',

                        content:
                            data.content || '',

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


                    /*
                     * Existing values should not automatically
                     * be overwritten when editing.
                     */

                    this.slugManuallyEdited =
                        true;


                    this.metaTitleManuallyEdited =
                        true;

                },


                // =================================================
                // ERROR
                // =================================================

                error: (
                    error: any
                ) => {

                    this.isLoading =
                        false;


                    if (
                        error?.status === 404
                    ) {

                        this.errorMessage =
                            'Page not found.';

                        return;

                    }


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to load page. Please try again.';

                }

            });

    }


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
    // TITLE CHANGE
    // =========================================================

    onTitleChange(): void {

        /*
         * On edit we preserve the existing slug.
         *
         * If you later want title changes to automatically
         * change the slug, set slugManuallyEdited = false.
         */

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
    // UPDATE PAGE
    // =========================================================

    updatePage(
        form: NgForm
    ): void {

        // =====================================================
        // RESET MESSAGES
        // =====================================================

        this.successMessage =
            '';

        this.errorMessage =
            '';

        this.errors =
            {};


        // =====================================================
        // VALIDATE FORM
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
            !this.page.title ||
            !this.page.title.trim()
        ) {

            this.errors.title =
                'Page title is required.';


            this.errorMessage =
                'Please complete the required fields.';


            return;

        }


        // =====================================================
        // SLUG
        // =====================================================

        if (
            !this.page.slug ||
            !this.page.slug.trim()
        ) {

            this.errors.slug =
                'Page URL is required.';


            this.errorMessage =
                'Please complete the required fields.';


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
        // UPDATE
        // =====================================================

        this.isSaving =
            true;


        this.apiService
            .put(
                `admin/pages/${this.pageId}`,
                data
            )
            .subscribe({

                // =================================================
                // SUCCESS
                // =================================================

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
                            'Page updated successfully.';


                        /*
                         * Keep user on edit page so they can
                         * continue editing.
                         */

                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });

                    }

                },


                // =================================================
                // ERROR
                // =================================================

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

                        'Unable to update page. Please try again.';


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
                (
                    file: File
                ) => {

                    return new Promise(
                        (
                            resolve,
                            reject
                        ) => {

                            // =================================
                            // FORM DATA
                            // =================================

                            const formData =
                                new FormData();


                            formData.append(
                                'image',
                                file,
                                file.name
                            );


                            // =================================
                            // UPLOAD
                            // =================================

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


                                        // =========================
                                        // CKEDITOR FORMAT
                                        // =========================

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
