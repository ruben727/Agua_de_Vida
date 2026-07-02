import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElasticsearchService, SearchResult } from '../../services/elasticsearch.service';

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
  results: SearchResult[] = [];
  isLoading = false;

  private debounceTimer: any = null;

  constructor(
    private router: Router,
    private elasticsearchService: ElasticsearchService
  ) {}

  @ViewChild('searchInput') searchInput?: ElementRef;

  getTypeLabel(type: string): string {
    switch (type) {
      case 'predica': return 'PRÉDICA';
      case 'aviso':   return 'AVISO';
      case 'pagina':  return 'PÁGINA';
      default:        return '';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'predica': return 'badge-predica';
      case 'aviso':   return 'badge-aviso';
      case 'pagina':  return 'badge-pagina';
      default:        return '';
    }
  }

  getRouteIcon(route: string): string {
    switch (route) {
      case '/':         return '🏠';
      case '/predicas': return '🎤';
      case '/avisos':   return '📢';
      case '/contacto': return '📍';
      default:          return '🔍';
    }
  }

  openSearch() {
    this.showSearch = true;
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 200);
  }

  closeSearch() {
    this.showSearch = false;
    this.searchQuery = '';
    this.results = [];
  }

  onSearchInput() {
    clearTimeout(this.debounceTimer);
    const q = this.searchQuery.trim();

    if (q.length < 2) {
      this.results = [];
      return;
    }

    this.isLoading = true;
    this.debounceTimer = setTimeout(() => this.performSearch(), 300);
  }

  async performSearch() {
    const q = this.searchQuery.trim();

    if (q.length < 2) {
      this.results = [];
      this.isLoading = false;
      return;
    }

    try {
      this.results = await this.elasticsearchService.search(q);
    } catch {
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
