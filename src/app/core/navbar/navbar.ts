import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { ElasticsearchService, SearchResult } from '../../services/elasticsearch.service';
import { MESES } from '../../shared/meses';

interface SubmenuItem {
  label: string;
  route: string;
  fragment?: string;
  queryParams?: Record<string, any>;
}

interface MenuItem {
  label: string;
  route: string;
  exact: boolean;
  submenu: SubmenuItem[];
}

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

  // Menú desplegable (escritorio) y drawer con acordeón (móvil)
  openDropdown: string | null = null;
  mobileNavOpen = false;
  mobileExpanded: string | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'INICIO',
      route: '/',
      exact: true,
      submenu: [
        { label: 'Horarios de Servicio', route: '/', fragment: 'horarios' },
        { label: 'Información General', route: '/', fragment: 'informacion' },
      ]
    },
    {
      label: 'PREDICAS',
      route: '/predicas',
      exact: false,
      submenu: [
        { label: 'Ver todas', route: '/predicas' },
        ...MESES.map(mes => ({
          label: mes.nombre,
          route: '/predicas',
          queryParams: { mes: mes.numero }
        }))
      ]
    },
    {
      label: 'AVISOS',
      route: '/avisos',
      exact: false,
      submenu: [
        { label: 'Ver todos', route: '/avisos' },
        ...MESES.map(mes => ({
          label: mes.nombre,
          route: '/avisos',
          queryParams: { mes: mes.numero }
        }))
      ]
    },
    {
      label: 'CONTACTO',
      route: '/contacto',
      exact: false,
      submenu: [
        { label: 'Ubicación', route: '/contacto', fragment: 'mapa' },
        { label: 'Redes Sociales', route: '/contacto', fragment: 'social' },
        { label: 'Enviar Mensaje', route: '/contacto', fragment: 'formulario' },
      ]
    }
  ];

  private debounceTimer: any = null;

  constructor(
    private router: Router,
    private elasticsearchService: ElasticsearchService
  ) {
    // Cierra cualquier menú abierto al navegar (link directo, back/forward, búsqueda, etc.)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.openDropdown = null;
      this.mobileNavOpen = false;
      this.mobileExpanded = null;
    });
  }

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

  // ===== MENÚ DESPLEGABLE (ESCRITORIO) =====
  // Activado por evento de puntero (click/tap), no por :hover, para funcionar igual en touch.
  toggleDropdown(label: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === label ? null : label;
  }

  closeDropdown() {
    this.openDropdown = null;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.openDropdown = null;
  }

  // ===== MENÚ HAMBURGUESA (MÓVIL) =====
  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (!this.mobileNavOpen) {
      this.mobileExpanded = null;
    }
  }

  closeMobileNav() {
    this.mobileNavOpen = false;
    this.mobileExpanded = null;
  }

  toggleMobileSection(label: string, event: Event) {
    event.stopPropagation();
    this.mobileExpanded = this.mobileExpanded === label ? null : label;
  }
}
