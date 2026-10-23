import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private TOKEN_KEY = 'medclinic_token';
    private USER_KEY = 'medclinic_user';
    constructor() {}
    // =========================================================
    // SAVE LOGIN
    // =========================================================
    saveLogin(
        token: string,
        user: any,
        remember: boolean = false
    ): void {
        const storage = remember
            ? localStorage
            : sessionStorage;
        this.clear();
        storage.setItem(
            this.TOKEN_KEY,
            token
        );
        storage.setItem(
            this.USER_KEY,
            JSON.stringify(user)
        );
    }
    // =========================================================
    // TOKEN
    // =========================================================
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY)
            || sessionStorage.getItem(this.TOKEN_KEY);
    }
    // =========================================================
    // USER
    // =========================================================
    getUser(): any {
        const data =
            localStorage.getItem(this.USER_KEY)
            || sessionStorage.getItem(this.USER_KEY);
        if (!data) {
            return null;
        }
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }
    // =========================================================
    // LOGIN STATUS
    // =========================================================
    isLoggedIn(): boolean {
        return !!this.getToken();
    }
    // =========================================================
    // CLEAR
    // =========================================================
    clear(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
    }
}
