import {
    Component,
    OnInit
} from '@angular/core';

import {
    ActivatedRoute,
    Router
} from '@angular/router';

import {
    ApiService
} from '../../../services/api.service';

import {
    ImageCroppedEvent,
    LoadedImage
} from 'ngx-image-cropper';

import * as ClassicEditor
    from '@ckeditor/ckeditor5-build-classic';


@Component({
    selector: 'app-slider-edit',
    templateUrl: './slider-edit.component.html',
    styleUrls: ['./slider-edit.component.css']
})
export class SliderEditComponent implements OnInit {

    // =========================================================
    // ID
    // =========================================================

    sliderId: number = 0;


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

            shouldNotGroupWhenFull:
                true

        }

    };


    editorMode:
        'visual' |
        'source' =
        'visual';


    // =========================================================
    // SLIDER
    // =========================================================

    slider: any = {

        title: '',

        subtitle: '',

        image: '',

        image_url: '',

        button_text: '',

        button_link: '',

        sort_order: 0,

        status: 1

    };


    // =========================================================
    // PAGE STATE
    // =========================================================

    isLoading:
        boolean = true;

    isSaving:
        boolean = false;

    successMessage:
        string = '';

    errorMessage:
        string = '';

    errors: any = {};


    // =========================================================
    // IMAGE
    // =========================================================

    imageError:
        string = '';

    isUploadingImage:
        boolean = false;


    // =========================================================
    // IMAGE CROPPER
    // =========================================================

    imageChangedEvent:
        Event | null = null;

    croppedImage:
        string = '';

    croppedBlob:
        Blob | null = null;

    showCropModal:
        boolean = false;

    isCroppingImage:
        boolean = false;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(

        private route:
            ActivatedRoute,

        private router:
            Router,

        private apiService:
            ApiService

    ) {}


    // =========================================================
    // INIT
    // =========================================================

    ngOnInit(): void {

        this.sliderId =
            Number(
                this.route.snapshot
                    .paramMap
                    .get('id')
            );


        if (!this.sliderId) {

            this.router.navigate([
                '/slider/list'
            ]);

            return;

        }


        this.loadSlider();

    }


    // =========================================================
    // LOAD SLIDER
    // =========================================================

    loadSlider(): void {

        this.isLoading =
            true;

        this.errorMessage =
            '';


        this.apiService
            .get(
                `admin/sliders/${this.sliderId}`
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isLoading =
                        false;


                    if (
                        response?.status !== 'success' ||
                        !response?.data
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to load slider.';

                        return;

                    }


                    const data =
                        response.data;


                    this.slider = {

                        title:
                            data.title || '',

                        subtitle:
                            data.subtitle || '',

                        image:
                            data.image || '',

                        image_url:
                            data.image_url || '',

                        button_text:
                            data.button_text || '',

                        button_link:
                            data.button_link || '',

                        sort_order:
                            Number(
                                data.sort_order || 0
                            ),

                        status:
                            Number(
                                data.status
                            ) === 1
                                ? 1
                                : 0

                    };

                },


                error: (
                    error: any
                ) => {

                    this.isLoading =
                        false;


                    this.errorMessage =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to load slider.';

                }

            });

    }


    // =========================================================
    // EDITOR MODE
    // =========================================================

    setEditorMode(
        mode:
            'visual' |
            'source'
    ): void {

        this.editorMode =
            mode;

    }


    // =========================================================
    // EDITOR READY
    // =========================================================

    onEditorReady(
        editor: any
    ): void {

        editor.plugins
            .get(
                'FileRepository'
            )
            .createUploadAdapter =
            (
                loader: any
            ) => {

                return new SliderEditorImageAdapter(
                    loader,
                    this.apiService
                );

            };

    }


    // =========================================================
    // IMAGE SELECT
    // =========================================================

    onImageSelected(
        event: Event
    ): void {

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


        this.imageError =
            '';


        // =====================================================
        // ALLOWED TYPES
        // =====================================================

        const allowedTypes: string[] = [
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
        // MAX 5MB
        // =====================================================

        const maxSize =
            5 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            this.imageError =
                'Image size must not exceed 5 MB.';

            input.value =
                '';

            return;

        }


        // =====================================================
        // OPEN CROPPER
        // =====================================================

        this.imageChangedEvent =
            event;

        this.croppedImage =
            '';

        this.croppedBlob =
            null;

        this.showCropModal =
            true;


        document.body
            .classList
            .add(
                'modal-open'
            );

    }


    // =========================================================
    // IMAGE CROPPED
    // =========================================================

    imageCropped(
        event: ImageCroppedEvent
    ): void {

        if (
            event.objectUrl
        ) {

            this.croppedImage =
                event.objectUrl;

        }


        if (
            event.blob
        ) {

            this.croppedBlob =
                event.blob;

        }

    }


    // =========================================================
    // IMAGE LOADED
    // =========================================================

    imageLoaded(
        image: LoadedImage
    ): void {}


    // =========================================================
    // CROPPER READY
    // =========================================================

    cropperReady(): void {}


    // =========================================================
    // IMAGE LOAD FAILED
    // =========================================================

    loadImageFailed(): void {

        this.imageError =
            'Unable to load the selected image.';


        this.closeCropModal();

    }


    // =========================================================
    // CLOSE CROPPER
    // =========================================================

    closeCropModal(): void {

        if (
            this.isCroppingImage
        ) {

            return;

        }


        this.showCropModal =
            false;

        this.imageChangedEvent =
            null;

        this.croppedImage =
            '';

        this.croppedBlob =
            null;


        document.body
            .classList
            .remove(
                'modal-open'
            );

    }


    // =========================================================
    // UPLOAD CROPPED IMAGE
    // =========================================================

    uploadCroppedImage(): void {

        if (
            !this.croppedBlob ||
            this.isCroppingImage
        ) {

            return;

        }


        this.isCroppingImage =
            true;

        this.isUploadingImage =
            true;

        this.imageError =
            '';


        const file =
            new File(
                [
                    this.croppedBlob
                ],
                `slider-${this.sliderId}-${Date.now()}.jpg`,
                {
                    type:
                        this.croppedBlob.type ||
                        'image/jpeg'
                }
            );


        const formData =
            new FormData();


        formData.append(
            'image',
            file
        );


        this.apiService
            .postFormData(
                `admin/sliders/${this.sliderId}/upload-image`,
                formData
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isCroppingImage =
                        false;

                    this.isUploadingImage =
                        false;


                    if (
                        response?.status !== 'success'
                    ) {

                        this.imageError =
                            response?.message ||
                            'Unable to upload slider image.';

                        return;

                    }


                    // Filename for DB
                    this.slider.image =
                        response.image || '';


                    // Full URL for preview
                    this.slider.image_url =
                        response.url || '';


                    this.showCropModal =
                        false;

                    this.imageChangedEvent =
                        null;

                    this.croppedImage =
                        '';

                    this.croppedBlob =
                        null;


                    document.body
                        .classList
                        .remove(
                            'modal-open'
                        );

                },


                error: (
                    error: any
                ) => {

                    this.isCroppingImage =
                        false;

                    this.isUploadingImage =
                        false;


                    this.imageError =

                        error
                            ?.error
                            ?.message

                        ||

                        'Unable to upload slider image.';

                }

            });

    }


    // =========================================================
    // VALIDATION
    // =========================================================

    validate(): boolean {

        this.errors =
            {};

        this.errorMessage =
            '';


        // =====================================================
        // TITLE
        // =====================================================

        if (
            !this.slider.title ||
            !this.slider.title.trim()
        ) {

            this.errors.title =
                'Slider title is required.';

        }


        // =====================================================
        // IMAGE
        // =====================================================

        if (
            !this.slider.image
        ) {

            this.imageError =
                'Slider image is required.';

        } else {

            this.imageError =
                '';

        }


        return (

            Object.keys(
                this.errors
            ).length === 0

            &&

            !!this.slider.image

        );

    }


    // =========================================================
    // SAVE / UPDATE SLIDER
    // =========================================================

    saveSlider(): void {

        if (
            this.isSaving ||
            this.isUploadingImage
        ) {

            return;

        }


        this.successMessage =
            '';

        this.errorMessage =
            '';


        // =====================================================
        // VALIDATE
        // =====================================================

        if (
            !this.validate()
        ) {

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });


            return;

        }


        // =====================================================
        // PAYLOAD
        // =====================================================

        const payload = {

            title:
                this.slider.title.trim(),

            subtitle:
                this.slider.subtitle || '',

            image:
                this.slider.image || '',

            button_text:
                this.slider.button_text
                    ? this.slider
                        .button_text
                        .trim()
                    : '',

            button_link:
                this.slider.button_link
                    ? this.slider
                        .button_link
                        .trim()
                    : '',

            sort_order:
                Number(
                    this.slider.sort_order ||
                    0
                ),

            status:
                Number(
                    this.slider.status
                ) === 1
                    ? 1
                    : 0

        };


        // =====================================================
        // SAVE
        // =====================================================

        this.isSaving =
            true;


        this.apiService
            .put(
                `admin/sliders/${this.sliderId}`,
                payload
            )
            .subscribe({

                next: (
                    response: any
                ) => {

                    this.isSaving =
                        false;


                    if (
                        response?.status !== 'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to update slider.';

                        return;

                    }


                    this.successMessage =
                        response?.message ||
                        'Slider updated successfully.';


                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });


                    setTimeout(
                        () => {

                            this.router.navigate([
                                '/slider/list'
                            ]);

                        },
                        700
                    );

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

                        'Unable to update slider.';


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

        if (
            this.isSaving ||
            this.isUploadingImage
        ) {

            return;

        }


        this.router.navigate([
            '/slider/list'
        ]);

    }

    // =========================================================
// OPEN IMAGE PICKER
// =========================================================

openImagePicker(): void {


    if (

        this.isUploadingImage ||

        this.isCroppingImage

    ) {

        return;

    }


    const input =

        document.getElementById(
            'sliderImageInput'
        ) as HTMLInputElement;



    if (input) {

        input.click();

    }


}

}


// =============================================================
// CKEDITOR IMAGE ADAPTER
// =============================================================

class SliderEditorImageAdapter {

    constructor(

        private loader: any,

        private apiService:
            ApiService

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
                                'upload',
                                file
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
                                            response?.url
                                        ) {

                                            resolve({
                                                default:
                                                    response.url
                                            });

                                        } else {

                                            reject(
                                                response?.message ||
                                                'Unable to upload image.'
                                            );

                                        }

                                    },


                                    error: (
                                        error: any
                                    ) => {

                                        reject(

                                            error
                                                ?.error
                                                ?.message

                                            ||

                                            'Unable to upload image.'

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
