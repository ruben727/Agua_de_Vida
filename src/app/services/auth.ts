// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginResponse } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {  // 👈 Asegúrate que la clase se llame AuthService
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(response => {
          if (response.success && response.user) {
            if (!response.user.faceRegistered) {
              this.setSession(response);
            }
          }
          return response;
        })
      );
  }

  completeFaceLogin(userId: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/face-complete`, { userId })
      .pipe(
        map(response => {
          if (response.success && response.user) {
            this.setSession(response);
          }
          return response;
        })
      );
  }

  registerFace(userId: string, faceId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/register-face`, { faceId });
  }

  private setSession(response: LoginResponse) {
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    this.currentUserSubject.next(response.user!);
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}