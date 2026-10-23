import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

type SettingsTab =
    | 'general'
    | 'contact'
    | 'social'
    | 'seo'
    | 'advanced';

@Component({
  standalone: false,
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    // =========================================================
    // ACTIVE TAB
    // =========================================================

    activeTab: SettingsTab = 'general';


    // =========================================================
    // FORM DATA
    // =========================================================

    formData: any = {

        // General
        site_name: '',
        site_tagline: '',

        // Contact
        contact_phone: '',
        contact_email: '',
        address: '',

        // Business
        abn: '',
        opening_hours: '',

        // Social
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        youtube_url: '',

        // Website
        footer_text: '',
        google_maps_embed_url: '',

        // SEO
        default_meta_title: '',
        default_meta_description: '',
        default_meta_keywords: '',

        // Advanced
        maintenance_mode: 0
    };


    // =========================================================
    // STATE
    // =========================================================

    isLoading: boolean = true;

    isSaving: boolean = false;

    successMessage: string = '';

    errorMessage: string = '';


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(
        private apiService: ApiService
    ) {}


    // =========================================================
    // INIT
    // =========================================================

    ngOnInit(): void {

        this.loadSettings();
    }


    // =========================================================
    // CHANGE TAB
    // =========================================================

    setTab(
        tab: SettingsTab
    ): void {

        this.activeTab = tab;

        this.successMessage = '';

        this.errorMessage = '';
    }


    // =========================================================
    // LOAD SETTINGS
    // =========================================================

    loadSettings(): void {

        this.isLoading = true;

        this.errorMessage = '';


        this.apiService
            .get('admin/settings')
            .subscribe({

                next: (response: any) => {

                    this.isLoading = false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to load settings.';

                        return;
                    }


                    const data =
                        response?.data || {};


                    this.formData = {

                        // =====================================
                        // GENERAL
                        // =====================================

                        site_name:
                            data.site_name || '',

                        site_tagline:
                            data.site_tagline || '',


                        // =====================================
                        // CONTACT
                        // =====================================

                        contact_phone:
                            data.contact_phone || '',

                        contact_email:
                            data.contact_email || '',

                        address:
                            data.address || '',


                        // =====================================
                        // BUSINESS
                        // =====================================

                        abn:
                            data.abn || '',

                        opening_hours:
                            data.opening_hours || '',


                        // =====================================
                        // SOCIAL
                        // =====================================

                        facebook_url:
                            data.facebook_url || '',

                        instagram_url:
                            data.instagram_url || '',

                        linkedin_url:
                            data.linkedin_url || '',

                        youtube_url:
                            data.youtube_url || '',


                        // =====================================
                        // WEBSITE
                        // =====================================

                        footer_text:
                            data.footer_text || '',

                        google_maps_embed_url:
                            data.google_maps_embed_url || '',


                        // =====================================
                        // SEO
                        // =====================================

                        default_meta_title:
                            data.default_meta_title || '',

                        default_meta_description:
                            data.default_meta_description || '',

                        default_meta_keywords:
                            data.default_meta_keywords || '',


                        // =====================================
                        // ADVANCED
                        // =====================================

                        maintenance_mode:
                            Number(
                                data.maintenance_mode || 0
                            )
                    };
                },


                error: (error: any) => {

                    console.error(
                        'Load settings error:',
                        error
                    );


                    this.isLoading = false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load settings.';
                }

            });
    }


    // =========================================================
    // SAVE SETTINGS
    // =========================================================

    saveSettings(): void {

        if (this.isSaving) {
            return;
        }


        this.successMessage = '';

        this.errorMessage = '';


        // =====================================================
        // SITE NAME VALIDATION
        // =====================================================

        if (
            !this.formData.site_name ||
            !this.formData.site_name.trim()
        ) {

            this.activeTab = 'general';

            this.errorMessage =
                'Site name is required.';

            return;
        }


        // =====================================================
        // EMAIL VALIDATION
        // =====================================================

        if (
            this.formData.contact_email &&
            !this.isValidEmail(
                this.formData.contact_email
            )
        ) {

            this.activeTab = 'contact';

            this.errorMessage =
                'Please enter a valid contact email address.';

            return;
        }


        // =====================================================
        // PAYLOAD
        // =====================================================

        const payload = {

            // General

            site_name:
                this.clean(
                    this.formData.site_name
                ),

            site_tagline:
                this.clean(
                    this.formData.site_tagline
                ),


            // Contact

            contact_phone:
                this.clean(
                    this.formData.contact_phone
                ),

            contact_email:
                this.clean(
                    this.formData.contact_email
                ),

            address:
                this.clean(
                    this.formData.address
                ),


            // Business

            abn:
                this.clean(
                    this.formData.abn
                ),

            opening_hours:
                this.clean(
                    this.formData.opening_hours
                ),


            // Social

            facebook_url:
                this.clean(
                    this.formData.facebook_url
                ),

            instagram_url:
                this.clean(
                    this.formData.instagram_url
                ),

            linkedin_url:
                this.clean(
                    this.formData.linkedin_url
                ),

            youtube_url:
                this.clean(
                    this.formData.youtube_url
                ),


            // Website

            footer_text:
                this.clean(
                    this.formData.footer_text
                ),

            google_maps_embed_url:
                this.clean(
                    this.formData.google_maps_embed_url
                ),


            // SEO

            default_meta_title:
                this.clean(
                    this.formData.default_meta_title
                ),

            default_meta_description:
                this.clean(
                    this.formData.default_meta_description
                ),

            default_meta_keywords:
                this.clean(
                    this.formData.default_meta_keywords
                ),


            // Advanced

            maintenance_mode:
                Number(
                    this.formData.maintenance_mode
                ) === 1
                    ? 1
                    : 0
        };


        // =====================================================
        // SAVE
        // =====================================================

        this.isSaving = true;


        this.apiService
            .put(
                'admin/settings',
                payload
            )
            .subscribe({

                next: (response: any) => {

                    this.isSaving = false;


                    if (
                        response?.status !==
                        'success'
                    ) {

                        this.errorMessage =
                            response?.message ||
                            'Unable to save settings.';

                        return;
                    }


                    this.successMessage =
                        response?.message ||
                        'Settings updated successfully.';
                },


                error: (error: any) => {

                    console.error(
                        'Save settings error:',
                        error
                    );


                    this.isSaving = false;


                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to save settings.';
                }

            });
    }


    // =========================================================
    // CLEAN VALUE
    // =========================================================

    private clean(
        value: any
    ): string {

        if (
            value === null ||
            value === undefined
        ) {

            return '';
        }


        return String(value).trim();
    }


    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    private isValidEmail(
        value: string
    ): boolean {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(
                value.trim()
            );
    }
}
