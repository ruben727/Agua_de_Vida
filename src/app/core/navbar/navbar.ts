import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElasticsearchService } from '../../services/elasticsearch.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  showSearch = false;
  showSidebar = false;
  searchQuery = '';
  results: any[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private elasticsearchService: ElasticsearchService
  ) {
    console.log('NavbarComponent inicializado');
  }

  @ViewChild('searchInput') searchInput?: ElementRef;

  // Método para obtener ícono según la ruta
  getRouteIcon(route: string): string {
    switch(route) {
      case '/': return '';
      case '/predicas': return '';
      case '/avisos': return '';
      case '/contacto': return '';
      default: return '🔍';
    }
  }

  openSearch() {
    this.showSearch = true;
    setTimeout(() => {
      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 200);
  }

  closeSearch() {
    this.showSearch = false;
    this.searchQuery = '';
    this.results = [];
  }

  async performSearch() {
    const q = this.searchQuery.trim();
    
    if (q.length < 2) {
      this.results = [];
      return;
    }
    
    this.isLoading = true;
    
    try {
      this.results = await this.elasticsearchService.search(q);
      console.log('Resultados:', this.results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      this.results = [];
    } finally {
      this.isLoading = false;
    }
  }

  goTo(route: string) {
    this.router.navigate([route]);
    this.closeSearch();
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar() {
    this.showSidebar = false;
  }
}