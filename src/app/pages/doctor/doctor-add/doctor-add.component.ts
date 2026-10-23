import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';

import { NgForm } from '@angular/forms';

import { ApiService } from '../../../services/api.service';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  standalone: false,
  selector: 'app-doctor-add',
  templateUrl: './doctor-add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./doctor-add.component.css'],
})
export class DoctorAddComponent implements OnInit {
  // =========================================================
  // IMAGE CROPPER
  // =========================================================

  imageChangedEvent: Event | null = null;

  croppedImage: string = '';

  croppedBlob: Blob | null = null;

  showCropModal: boolean = false;

  isCroppingImage: boolean = false;

  // =========================================================
  // CKEDITOR
  // =========================================================

  public Editor: any = ClassicEditor;

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
        'redo',
      ],

      shouldNotGroupWhenFull: true,
    },
  };

  editorMode: 'visual' | 'source' = 'visual';

  // =========================================================
  // DOCTOR MODEL
  // =========================================================

  doctor: any = {
    category_id: '',

    name: '',

    qualification: '',

    short_description: '',

    content: '',

    image: '',

    status: 1,

    sort_order: 0,
  };

  // =========================================================
  // CATEGORY
  // =========================================================

  categories: any[] = [];

  isLoadingCategories: boolean = false;

  // =========================================================
  // LANGUAGES
  // =========================================================

  languages: string[] = [];

  languageInput: string = '';

  // =========================================================
  // AREAS OF INTEREST
  // =========================================================

  interests: string[] = [];

  interestInput: string = '';

  // =========================================================
  // AVAILABILITY
  // =========================================================

  availability: any[] = [
    {
      day_of_week: 1,
      day: 'Monday',
      short: 'MO',
      is_available: true,
      start_time: '09:30',
      end_time: '16:00',
    },

    {
      day_of_week: 2,
      day: 'Tuesday',
      short: 'TU',
      is_available: true,
      start_time: '09:30',
      end_time: '16:00',
    },

    {
      day_of_week: 3,
      day: 'Wednesday',
      short: 'WE',
      is_available: true,
      start_time: '09:30',
      end_time: '16:00',
    },

    {
      day_of_week: 4,
      day: 'Thursday',
      short: 'TH',
      is_available: true,
      start_time: '09:30',
      end_time: '16:00',
    },

    {
      day_of_week: 5,
      day: 'Friday',
      short: 'FR',
      is_available: true,
      start_time: '09:30',
      end_time: '16:00',
    },

    {
      day_of_week: 6,
      day: 'Saturday',
      short: 'SA',
      is_available: false,
      start_time: '',
      end_time: '',
    },

    {
      day_of_week: 7,
      day: 'Sunday',
      short: 'SU',
      is_available: false,
      start_time: '',
      end_time: '',
    },
  ];

  // =========================================================
  // STATE
  // =========================================================

  isSaving: boolean = false;

  isUploadingImage: boolean = false;

  successMessage: string = '';

  errorMessage: string = '';

  imageError: string = '';

  errors: any = {};

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadCategories();
  }

  // =========================================================
  // CATEGORY NAME
  // =========================================================

  get selectedCategoryName(): string {
    if (!this.doctor.category_id) {
      return 'Not selected';
    }

    const category = this.categories.find(
      (item) => Number(item.id) === Number(this.doctor.category_id),
    );

    return category ? category.name : 'Not selected';
  }

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  loadCategories(): void {
    this.isLoadingCategories = true;

    this.apiService.get('admin/doctors/categories').subscribe({
      next: (response: any) => {
        this.isLoadingCategories = false;

        if (response?.status) {
          this.categories = response.data || [];
        } else {
          this.categories = [];
        }
      },

      error: (error: any) => {
        this.isLoadingCategories = false;

        this.categories = [];

        this.errorMessage =
          error?.error?.message || 'Unable to load doctor categories.';
      },
    });
  }

  // =========================================================
  // CKEDITOR MODE
  // =========================================================

  setEditorMode(mode: 'visual' | 'source'): void {
    this.editorMode = mode;
  }

  // =========================================================
  // CKEDITOR READY
  // =========================================================

  onEditorReady(editor: any): void {
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any,
    ) => {
      return new DoctorEditorImageAdapter(loader, this.apiService);
    };
  }

  // =========================================================
  // SELECT PROFILE IMAGE
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


    this.imageError = '';


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

        input.value = '';

        return;
    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        this.imageError =
            'Image size must not exceed 5 MB.';

        input.value = '';

        return;
    }


    // Send selected image to cropper.

    this.imageChangedEvent =
        event;

    this.croppedImage = '';

    this.croppedBlob = null;

    this.showCropModal = true;


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
): void {

    // Image is ready for cropping.

}


// =========================================================
// CROPPER READY
// =========================================================

cropperReady(): void {

    // Cropper is ready.

}


// =========================================================
// LOAD IMAGE FAILED
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


    this.showCropModal = false;

    this.imageChangedEvent = null;

    this.croppedImage = '';

    this.croppedBlob = null;


    document.body.classList.remove(
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


    this.isCroppingImage = true;

    this.imageError = '';


    const file =
        new File(
            [
                this.croppedBlob
            ],
            'doctor-profile.jpg',
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
            'admin/doctors/upload-image',
            formData
        )
        .subscribe({

            next: (
                response: any
            ) => {

                this.isCroppingImage =
                    false;


                if (
                    !response?.status
                ) {

                    this.imageError =
                        response?.message ||
                        'Unable to upload doctor image.';

                    return;
                }


                this.doctor.image =
                    response.url;


                this.showCropModal =
                    false;

                this.imageChangedEvent =
                    null;

                this.croppedImage =
                    '';

                this.croppedBlob =
                    null;


                document.body.classList.remove(
                    'modal-open'
                );

            },


            error: (
                error: any
            ) => {

                this.isCroppingImage =
                    false;


                this.imageError =

                    error
                        ?.error
                        ?.message

                    ||

                    'Unable to upload doctor image.';

            }

        });

}

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  removeImage(): void {
    if (this.isUploadingImage) {
      return;
    }

    this.doctor.image = '';

    this.imageError = '';
  }

  // =========================================================
  // ADD LANGUAGE
  // =========================================================

  addLanguage(): void {
    const language = this.languageInput.trim();

    if (!language) {
      return;
    }

    const exists = this.languages.some(
      (item) => item.toLowerCase() === language.toLowerCase(),
    );

    if (!exists) {
      this.languages.push(language);
    }

    this.languageInput = '';
  }

  // =========================================================
  // LANGUAGE KEYDOWN
  // =========================================================

  languageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();

      this.addLanguage();
    }
  }

  // =========================================================
  // REMOVE LANGUAGE
  // =========================================================

  removeLanguage(index: number): void {
    if (index < 0 || index >= this.languages.length) {
      return;
    }

    this.languages.splice(index, 1);
  }

  // =========================================================
  // ADD INTEREST
  // =========================================================

  addInterest(): void {
    const interest = this.interestInput.trim();

    if (!interest) {
      return;
    }

    const exists = this.interests.some(
      (item) => item.toLowerCase() === interest.toLowerCase(),
    );

    if (!exists) {
      this.interests.push(interest);
    }

    this.interestInput = '';
  }

  // =========================================================
  // INTEREST KEYDOWN
  // =========================================================

  interestKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();

      this.addInterest();
    }
  }

  // =========================================================
  // REMOVE INTEREST
  // =========================================================

  removeInterest(index: number): void {
    if (index < 0 || index >= this.interests.length) {
      return;
    }

    this.interests.splice(index, 1);
  }

  // =========================================================
  // MOVE INTEREST UP
  // =========================================================

  moveInterestUp(index: number): void {
    if (index <= 0) {
      return;
    }

    const current = this.interests[index];

    this.interests[index] = this.interests[index - 1];

    this.interests[index - 1] = current;
  }

  // =========================================================
  // MOVE INTEREST DOWN
  // =========================================================

  moveInterestDown(index: number): void {
    if (index >= this.interests.length - 1) {
      return;
    }

    const current = this.interests[index];

    this.interests[index] = this.interests[index + 1];

    this.interests[index + 1] = current;
  }

  // =========================================================
  // AVAILABILITY TOGGLE
  // =========================================================

  toggleAvailability(item: any): void {
    if (item.is_available) {
      if (!item.start_time) {
        item.start_time = '09:30';
      }

      if (!item.end_time) {
        item.end_time = '16:00';
      }
    } else {
      item.start_time = '';

      item.end_time = '';
    }
  }

  // =========================================================
  // COPY MONDAY TO WEEKDAYS
  // =========================================================

  copyMondayToWeekdays(): void {
    const monday = this.availability.find((item) => item.day_of_week === 1);

    if (!monday) {
      return;
    }

    this.availability.forEach((item) => {
      if (item.day_of_week >= 2 && item.day_of_week <= 5) {
        item.is_available = monday.is_available;

        item.start_time = monday.is_available ? monday.start_time : '';

        item.end_time = monday.is_available ? monday.end_time : '';
      }
    });
  }

  // =========================================================
  // AVAILABLE DAY COUNT
  // =========================================================

  get availableDayCount(): number {
    return this.availability.filter((item) => item.is_available).length;
  }

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  validate(): boolean {
    this.errors = {};

    this.errorMessage = '';

    // =====================================================
    // NAME
    // =====================================================

    if (!this.doctor.name || !this.doctor.name.trim()) {
      this.errors.name = 'Doctor name is required.';
    }

    // =====================================================
    // CATEGORY
    // =====================================================

    if (!this.doctor.category_id) {
      this.errors.category_id = 'Please select a doctor category.';
    }

    // =====================================================
    // AVAILABILITY
    // =====================================================

    for (const item of this.availability) {
      if (!item.is_available) {
        continue;
      }

      if (!item.start_time || !item.end_time) {
        this.errorMessage = `Please select start and end time for ${item.day}.`;

        return false;
      }

      if (item.start_time >= item.end_time) {
        this.errorMessage = `${item.day} end time must be after start time.`;

        return false;
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  // =========================================================
  // SAVE DOCTOR
  // =========================================================

  saveDoctor(form: NgForm): void {
    if (this.isSaving || this.isUploadingImage) {
      return;
    }

    this.successMessage = '';

    this.errorMessage = '';

    // =====================================================
    // ADD UNSAVED INPUT VALUE
    // =====================================================

    if (this.languageInput.trim()) {
      this.addLanguage();
    }

    if (this.interestInput.trim()) {
      this.addInterest();
    }

    // =====================================================
    // VALIDATE
    // =====================================================

    if (form.invalid || !this.validate()) {
      form.control.markAllAsTouched();

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {
      category_id: Number(this.doctor.category_id),

      name: this.doctor.name.trim(),

      qualification: this.doctor.qualification
        ? this.doctor.qualification.trim()
        : '',

      short_description: this.doctor.short_description
        ? this.doctor.short_description.trim()
        : '',

      content: this.doctor.content || '',

      image: this.doctor.image || '',

      languages: this.languages,

      interests: this.interests,

      availability: this.availability.map((item) => {
        return {
          day_of_week: item.day_of_week,

          is_available: item.is_available ? 1 : 0,

          start_time: item.is_available ? item.start_time : null,

          end_time: item.is_available ? item.end_time : null,
        };
      }),

      status: Number(this.doctor.status),

      sort_order: Number(this.doctor.sort_order || 0),
    };

    // =====================================================
    // SAVE
    // =====================================================

    this.isSaving = true;

    this.apiService.post('admin/doctors', payload).subscribe({
      next: (response: any) => {
        this.isSaving = false;

        if (!response?.status) {
          this.errorMessage = response?.message || 'Unable to create doctor.';

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });

          return;
        }

        this.successMessage =
          response?.message || 'Doctor created successfully.';

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        setTimeout(() => {
          this.router.navigate(['/doctor/list']);
        }, 700);
      },

      error: (error: any) => {
        this.isSaving = false;

        this.errorMessage = error?.error?.message || 'Unable to create doctor.';

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
    });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    this.router.navigate(['/doctor/list']);
  }
}

// =============================================================
// CKEDITOR IMAGE UPLOAD ADAPTER
// =============================================================

class DoctorEditorImageAdapter {
  constructor(
    private loader: any,
    private apiService: ApiService,
  ) {}

  // =========================================================
  // UPLOAD
  // =========================================================

  upload(): Promise<any> {
    return this.loader.file.then((file: File) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();

        formData.append('upload', file);

        this.apiService
          .postFormData('admin/editor/upload-image', formData)
          .subscribe({
            next: (response: any) => {
              if (response?.url) {
                resolve({
                  default: response.url,
                });
              } else {
                reject(response?.message || 'Unable to upload image.');
              }
            },

            error: (error: any) => {
              reject(error?.error?.message || 'Unable to upload image.');
            },
          });
      });
    });
  }

  // =========================================================
  // ABORT
  // =========================================================

  abort(): void {}
}
