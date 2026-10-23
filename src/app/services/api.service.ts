import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // =========================================================
  // API URL
  // =========================================================

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
  ) {}

  // =========================================================
  // HEADERS
  // =========================================================

  private getHeaders(): HttpHeaders {

    const token = this.tokenStorage.getToken();


    let headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });


    if (token) {

        headers = headers.set(
            'Authorization',
            'Bearer ' + token
        );

    }


    return headers;
}

  // =========================================================
  // BUILD URL
  // =========================================================

  private buildUrl(endpoint: string): string {
    endpoint = endpoint.replace(/^\/+/, '');

    return this.apiUrl + endpoint;
  }

  // =========================================================
  // GET
  // =========================================================

  get(endpoint: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];

        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get(this.buildUrl(endpoint), {
      headers: this.getHeaders(),
      params: httpParams,
    });
  }

  // =========================================================
  // POST
  // =========================================================

  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(this.buildUrl(endpoint), data, {
      headers: this.getHeaders(),
    });
  }

  // =========================================================
  // PUT
  // =========================================================

  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(this.buildUrl(endpoint), data, {
      headers: this.getHeaders(),
    });
  }

  // =========================================================
  // PATCH
  // =========================================================

  patch(endpoint: string, data: any): Observable<any> {
    return this.http.patch(this.buildUrl(endpoint), data, {
      headers: this.getHeaders(),
    });
  }

  // =========================================================
  // DELETE
  // =========================================================

  delete(endpoint: string): Observable<any> {
    return this.http.delete(this.buildUrl(endpoint), {
      headers: this.getHeaders(),
    });
  }

  // =========================================================
  // POST FORM DATA
  // Image / File Upload
  // =========================================================

  postFormData(endpoint: string, data: FormData): Observable<any> {
    return this.http.post(this.buildUrl(endpoint), data, {
      headers: this.getAuthHeaders(),
    });
  }

  // =========================================================
  // PUT FORM DATA
  // Image / File Update
  // =========================================================

  putFormData(endpoint: string, data: FormData): Observable<any> {
    return this.http.put(this.buildUrl(endpoint), data, {
      headers: this.getAuthHeaders(),
    });
  }

  // =========================================================
  // AUTH HEADER ONLY
  //
  // IMPORTANT:
  // Do NOT manually set Content-Type for FormData.
  // Browser will automatically set multipart/form-data
  // including the boundary.
  // =========================================================

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();

    let headers = new HttpHeaders({
      Accept: 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
