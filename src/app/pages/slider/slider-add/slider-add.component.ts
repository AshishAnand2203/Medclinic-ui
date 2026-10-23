import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  ApiService
} from 'src/app/services/api.service';

import {
  ImageCroppedEvent
} from 'ngx-image-cropper';

import * as ClassicEditor
  from '@ckeditor/ckeditor5-build-classic';


@Component({
  standalone: false,
  selector: 'app-slider-add',
  templateUrl: './slider-add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./slider-add.component.css']
})
export class SliderAddComponent implements OnDestroy {

  // =========================================================
  // SLIDER
  // =========================================================

  slider: any = {
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    sort_order: 0,
    status: 1
  };


  // =========================================================
  // PAGE STATE
  // =========================================================

  isSaving: boolean = false;

  successMessage: string = '';

  errorMessage: string = '';

  imageError: string = '';


  // =========================================================
  // IMAGE CROPPER
  // =========================================================

  imageChangedEvent: any = '';

  croppedBlob: Blob | null = null;

  croppedImage: string = '';

  previewImage: string = '';

  selectedFileName: string = '';

  showCropperModal: boolean = false;

  cropperLoading: boolean = false;


  // =========================================================
  // CKEDITOR
  // =========================================================

  public Editor: any = ClassicEditor;

  editorMode: 'visual' | 'source' = 'visual';

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

    }

  };


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.revokePreview();

  }


  // =========================================================
  // EDITOR MODE
  // =========================================================

  setEditorMode(
    mode: 'visual' | 'source'
  ): void {

    this.editorMode = mode;

  }


  // =========================================================
  // EDITOR READY
  // =========================================================

  onEditorReady(editor: any): void {

    editor.plugins
      .get('FileRepository')
      .createUploadAdapter =
      (loader: any) => {

        return new SliderEditorUploadAdapter(
          loader,
          this.apiService
        );

      };

  }


  // =========================================================
  // IMAGE SELECT
  // =========================================================

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file = input.files[0];


    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];


    if (
      !allowedTypes.includes(file.type)
    ) {

      this.imageError =
        'Only JPG, PNG and WebP images are allowed.';

      input.value = '';

      return;

    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      this.imageError =
        'Image size must not exceed 5MB.';

      input.value = '';

      return;

    }


    this.imageError = '';

    this.errorMessage = '';

    this.selectedFileName =
      file.name;

    this.imageChangedEvent =
      event;

    this.croppedBlob =
      null;

    this.croppedImage =
      '';

    this.cropperLoading =
      true;

    this.showCropperModal =
      true;

  }


  // =========================================================
  // IMAGE CROPPED
  // =========================================================

  imageCropped(
    event: ImageCroppedEvent
  ): void {

    if (event.blob) {

      this.croppedBlob =
        event.blob;

    }


    if (event.objectUrl) {

      this.croppedImage =
        event.objectUrl;

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
  // LOAD FAILED
  // =========================================================

  loadImageFailed(): void {

    this.cropperLoading =
      false;

    this.showCropperModal =
      false;

    this.imageChangedEvent =
      '';

    this.croppedBlob =
      null;

    this.croppedImage =
      '';

    this.imageError =
      'Unable to load selected image.';

  }


  // =========================================================
  // APPLY CROP
  // =========================================================

  applyCrop(): void {

    if (!this.croppedBlob) {

      return;

    }


    this.revokePreview();


    this.previewImage =
      URL.createObjectURL(
        this.croppedBlob
      );


    this.showCropperModal =
      false;

    this.imageChangedEvent =
      '';

  }


  // =========================================================
  // CANCEL CROP
  // =========================================================

  cancelCrop(): void {

    this.showCropperModal =
      false;

    this.imageChangedEvent =
      '';

    this.croppedBlob =
      null;

    this.croppedImage =
      '';

    this.selectedFileName =
      '';

  }


  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  removeImage(): void {

    this.revokePreview();

    this.previewImage =
      '';

    this.croppedBlob =
      null;

    this.croppedImage =
      '';

    this.selectedFileName =
      '';

    this.imageChangedEvent =
      '';

    this.imageError =
      '';

  }


  // =========================================================
  // REVOKE OBJECT URL
  // =========================================================

  private revokePreview(): void {

    if (
      this.previewImage &&
      this.previewImage.startsWith('blob:')
    ) {

      URL.revokeObjectURL(
        this.previewImage
      );

    }

  }


  // =========================================================
  // SAVE
  // =========================================================

  saveSlider(): void {

    this.errorMessage =
      '';

    this.successMessage =
      '';

    this.imageError =
      '';


    // =====================================================
    // TITLE
    // =====================================================

    if (
      !this.slider.title ||
      !this.slider.title.trim()
    ) {

      this.errorMessage =
        'Slider title is required.';

      return;

    }


    // =====================================================
    // IMAGE
    // =====================================================

    if (!this.croppedBlob) {

      this.imageError =
        'Slider image is required.';

      return;

    }


    // =====================================================
    // FORM DATA
    // =====================================================

    const formData =
      new FormData();


    formData.append(
      'title',
      this.slider.title.trim()
    );


    formData.append(
      'subtitle',
      this.slider.subtitle || ''
    );


    formData.append(
      'button_text',
      this.slider.button_text || ''
    );


    formData.append(
      'button_link',
      this.slider.button_link || ''
    );


    formData.append(
      'sort_order',
      String(
        this.slider.sort_order || 0
      )
    );


    formData.append(
      'status',
      String(
        Number(this.slider.status) === 1
          ? 1
          : 0
      )
    );


    // =====================================================
    // IMAGE
    // =====================================================

    const imageFile =
      new File(
        [this.croppedBlob],
        `slider-${Date.now()}.jpg`,
        {
          type: 'image/jpeg'
        }
      );


    formData.append(
      'image',
      imageFile,
      imageFile.name
    );


    // =====================================================
    // SAVE
    // =====================================================

    this.isSaving =
      true;


    this.apiService
      .postFormData(
        'admin/sliders',
        formData
      )
      .subscribe({

        next: (response: any) => {

          this.isSaving =
            false;


          if (
            response?.status !== 'success'
          ) {

            this.errorMessage =
              response?.message ||
              'Unable to save slider.';

            return;

          }


          this.successMessage =
            response?.message ||
            'Slider added successfully.';


          setTimeout(() => {

            this.router.navigate([
              '/slider/list'
            ]);

          }, 700);

        },


        error: (error: any) => {

          this.isSaving =
            false;


          this.errorMessage =
            error?.error?.message ||
            'Unable to save slider.';

        }

      });

  }


  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    this.router.navigate([
      '/slider/list'
    ]);

  }

}


// =============================================================
// CKEDITOR IMAGE UPLOAD ADAPTER
// =============================================================

class SliderEditorUploadAdapter {

  constructor(
    private loader: any,
    private apiService: ApiService
  ) {}


  upload(): Promise<any> {

    return this.loader.file.then(

      (file: File) => {

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

                next: (response: any) => {

                  if (response?.url) {

                    resolve({
                      default: response.url
                    });

                    return;

                  }


                  reject(
                    response?.message ||
                    'Image upload failed.'
                  );

                },


                error: (error: any) => {

                  reject(
                    error?.error?.message ||
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
