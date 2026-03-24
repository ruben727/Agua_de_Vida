// src/app/auth/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FaceCapture } from '../face-capture/face-capture';
import { LoginResponse } from '../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FaceCapture
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  step: 'credentials' | 'face-verification' = 'credentials';
  currentUserId: string = '';
  faceDescriptor: Float32Array | null = null; // 👈 Añadido para guardar el descriptor

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmitCredentials(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        
        if (response.success && response.user) {
          if (response.user.faceRegistered) {
            this.currentUserId = response.user.id;
            this.step = 'face-verification';
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.errorMessage = response.error || 'Credenciales incorrectas';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Error de conexión con el servidor';
        console.error('Login error:', error);
      }
    });
  }

  // 👈 CORREGIDO: Ahora acepta descriptor en lugar de faceId
  onFaceCaptured(event: { descriptor: Float32Array; imageBase64: string }): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.faceDescriptor = event.descriptor;
    
    console.log('Face captured, descriptor length:', event.descriptor.length);
    console.log('Image captured, size:', event.imageBase64.length);
    
    // Aquí puedes enviar el descriptor a tu backend para verificación
    this.authService.completeFaceLogin(this.currentUserId).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.error || 'Error en verificación facial';
          this.step = 'credentials';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Error en verificación facial. Intenta nuevamente.';
        this.step = 'credentials';
        console.error('Face verification error:', error);
      }
    });
  }

  onFaceError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  goBack(): void {
    this.step = 'credentials';
    this.errorMessage = '';
  }
}