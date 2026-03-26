import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  token: string | null = null;
  userData: any = null;
  sidebarCollapsed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        localStorage.setItem('admin_token', this.token);
        // SOLO CAMBIÉ ESTA LÍNEA: eliminé { replaceUrl: true } para conservar el token en la URL
        this.router.navigate(['/admin/panel']);
        this.getUserData();
      } else {
        const savedToken = localStorage.getItem('admin_token');
        if (!savedToken) {
          this.router.navigate(['/login']);
        } else {
          this.token = savedToken;
          this.getUserData();
        }
      }
    });
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  getUserData() {
    fetch('https://adv-backend-two.vercel.app/api/me', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    .then(response => {
      if (!response.ok) throw new Error('No autorizado');
      return response.json();
    })
    .then(data => {
      this.userData = data.user;
    })
    .catch(error => {
      console.error('Error:', error);
      localStorage.removeItem('admin_token');
      this.router.navigate(['/login']);
    });
  }

  // Método para descargar la guía de estilos
  downloadStyleGuide() {
    const pdfUrl = '/Guíaestilosadv.pdf';
    
    // Crear un enlace temporal para forzar la descarga
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Guíaestilosadv.pdf'; // Nombre con el que se descargará
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  logout() {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/login']);
  }
}