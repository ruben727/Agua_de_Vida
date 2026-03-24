import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = signal('');
  password = signal('');
  loading = signal(false);
  success = signal(false);
  errorMsg = signal('');

  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  onEmailChange(value: string) {
    this.email.set(value);
    this.errorMsg.set('');
  }

  onPasswordChange(value: string) {
    this.password.set(value);
    this.errorMsg.set('');
  }

  onSubmit() {
    if (!this.email() || !this.password()) {
      this.errorMsg.set('Por favor completa todos los campos.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.http.post(`${this.API_URL}/login`, {
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Credenciales incorrectas.');
      }
    });
  }
}