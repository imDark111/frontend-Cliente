import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, LoginRequest, LoginResponse, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;
  private tokenKey = 'auth_token_cliente';

  constructor(private http: HttpClient) {
    const user = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setSession(response.data.usuario, response.data.token);
          }
        })
      );
  }

  verify2FA(userId: string, code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/verify-2fa`, { userId, token: code })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setSession(response.data.usuario, response.data.token);
          }
        })
      );
  }

  register(userData: any): Observable<ApiResponse<{ usuario: Usuario, token: string }>> {
    return this.http.post<ApiResponse<{ usuario: Usuario, token: string }>>(
      `${this.apiUrl}/auth/register`, 
      userData
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data.usuario, response.data.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('current_user_cliente');
    this.currentUserSubject.next(null);
  }

  getMe(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
            this.saveUserToStorage(response.data);
          }
        })
      );
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${environment.apiUrl}/usuarios/cambiar-password`, {
      passwordActual,
      passwordNueva
    });
  }

  habilitar2FA(): Observable<ApiResponse<{ qrCode: string, secret: string }>> {
    return this.http.post<ApiResponse<{ qrCode: string, secret: string }>>(
      `${this.apiUrl}/auth/enable-2fa`, 
      {}
    );
  }

  verificar2FAConfig(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/confirm-2fa`, { token });
  }

  deshabilitar2FA(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/disable-2fa`, {});
  }

  enable2FA(): Observable<ApiResponse<{ qrCode: string, secret: string }>> {
    return this.http.post<ApiResponse<{ qrCode: string, secret: string }>>(
      `${this.apiUrl}/auth/enable-2fa`, 
      {}
    );
  }

  confirm2FA(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/confirm-2fa`, { token });
  }

  disable2FA(password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/disable-2fa`, { password });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private setSession(usuario: Usuario, token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.saveUserToStorage(usuario);
    this.currentUserSubject.next(usuario);
  }

  private saveUserToStorage(usuario: Usuario): void {
    localStorage.setItem('current_user_cliente', JSON.stringify(usuario));
  }

  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem('current_user_cliente');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}
